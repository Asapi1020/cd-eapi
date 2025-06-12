import type { Payload } from "@asp1020/discord-webhook-client";
import { isObject } from "@asp1020/type-utils";
import { createId as cuid } from "@paralleldrive/cuid2";
import type { QueryResult } from "gamedig";
import type {
	GetMatchRecordsParams,
	MatchInfo,
	MatchRecord,
	PostRecordRequest,
	Record,
	SteamUser,
	UserRecord,
	UserStats,
	getRecordsParams,
} from "../domain";
import { type DiscordWebhookClient, type MongoDB, type SteamAPIClient, VERSION } from "../infra";
import { getBasicCDInfo, getMapInfo, getPlayersInfo, getStrangeSettings } from "../utils/RecordUtils";
import { convertSteam32To64ID } from "../utils/SteamUtils";
import type { Context } from "./Context";

export class RecordUsecase {
	private context: Context;

	constructor(context: Context) {
		this.context = context;
	}

	private get db(): MongoDB {
		return this.context.infra.mongoDB;
	}

	private get steamAPIClient(): SteamAPIClient {
		return this.context.infra.steamAPIClient;
	}

	private get discordWebhookClient(): DiscordWebhookClient {
		return this.context.infra.discordWebhookClient;
	}

	public async getRecords(params: getRecordsParams): Promise<[Record[], number]> {
		return await this.db.getRecords(params);
	}

	public async getRecordsV2(params: GetMatchRecordsParams): Promise<[MatchRecord[], UserRecord[], number]> {
		const [matchRecords, total] = await this.db.getMatchRecords(params);
		const userRecords = await this.db.getUserRecordsByRecordIDs(matchRecords.map((record) => record.recordID));
		return [matchRecords, userRecords, total];
	}

	public async getRecordByID(id: string): Promise<Record | null> {
		return await this.db.getRecord(id);
	}

	public async getRecordByIDV2(recordID: string): Promise<[MatchRecord, UserRecord[]] | undefined> {
		const matchRecord = await this.db.getMatchRecordByID(recordID);
		const userRecords = await this.db.getUserRecordsByRecordIDs([recordID]);
		if (!matchRecord) {
			return;
		}
		return [matchRecord, userRecords];
	}

	public async getUsersRecords(
		param: GetMatchRecordsParams,
		steamID: string,
	): Promise<[MatchRecord[], UserRecord[], number]> {
		const [matchRecords, total] = await this.db.getUsersMatchRecordsBySteamID(param, steamID);
		const userRecords = await this.db.getUserRecordsByRecordIDs(matchRecords.map((record) => record.recordID));
		return [matchRecords, userRecords, total];
	}

	public async getUserStats(steamID: string): Promise<UserRecord[]> {
		const userRecords = await this.db.getUserRecordsBySteamID(steamID);
		return userRecords;
	}

	public async postRecord(request: PostRecordRequest): Promise<void> {
		try {
			const serverName = await this.fetchServerName(request.matchInfo.serverIP).catch(() => undefined);

			const steamUserMap = await this.getSteamUserMap(request.userStats.map((stat) => stat.steamID)).catch((error) => {
				console.error("Steam User Map Error", error);
				this.notifyError(error);
				return new Map<string, SteamUser>();
			});

			const now = new Date();

			const matchInfo: MatchInfo = {
				...request.matchInfo,
				serverName,
				timeStamp: now.toISOString(),
			};

			const userStats: UserStats[] = request.userStats.map((stat) => {
				const steamUser = steamUserMap.get(stat.steamID);
				return {
					...stat,
					steamID: steamUser?.id ?? convertSteam32To64ID(stat.steamID),
					playerName: steamUser?.name,
				};
			});

			const id = cuid();
			const record = { matchInfo, userStats, id, version: VERSION };
			await this.db.postRecord(record).catch((error) => console.error("Post Record Error", error));

			const matchRecord = {
				...request.matchInfo,
				serverName,
				timeStamp: now,
				recordID: id,
			};
			await this.db.postMatchRecord(matchRecord).catch((error) => console.error("Post Match Record Error", error));

			const userRecords = userStats.map((stat) => ({
				...stat,
				recordID: id,
			}));
			await this.db.postUserRecords(userRecords).catch((error) => console.error("Post User Records Error", error));

			if (record.matchInfo.isVictory && record.matchInfo.cheatMessages.length === 0) {
				await this.notifyRecordToDiscord(record);
			}
		} catch (error) {
			await this.notifyError(error).catch(console.error);
			throw error;
		}
	}

	private async fetchServerName(serverIP: string): Promise<string | null> {
		const serverInfo: QueryResult = await this.steamAPIClient.getServerInfo(serverIP.split(":")[0]).catch((error) => {
			console.log("Server Info Error", error);
			return null;
		});
		return serverInfo?.name ?? null;
	}

	private async getSteamUserMap(steam32IDs: string[]): Promise<Map<string, SteamUser>> {
		const steamIDMap = new Map(steam32IDs.map((id) => [id, convertSteam32To64ID(id)]));
		const steam64IDs = Array.from(steamIDMap.values());
		const steamUsers = await this.steamAPIClient.getPlayerSummaries(steam64IDs);
		const steamUserMap = new Map(
			steam32IDs.map((steam32ID) => {
				const steam64ID = steamIDMap.get(steam32ID);
				const steamUser = steamUsers.find((user) => user.id === steam64ID);
				return [steam32ID, steamUser];
			}),
		);
		return steamUserMap;
	}

	private async notifyRecordToDiscord(record: Record): Promise<void> {
		const [mapName, mapThumbnail] = getMapInfo(record.matchInfo.mapName);

		const payload: Payload = {
			embeds: [
				{
					author: {
						name: record.matchInfo.isSolo ? "Solo" : (record.matchInfo.serverName ?? record.matchInfo.serverIP),
					},
					title: mapName,
					description: getBasicCDInfo(record.matchInfo.CDInfo),
					thumbnail: {
						url: mapThumbnail,
					},
					fields: [
						{
							name: "Other Info",
							value: getStrangeSettings(record.matchInfo.CDInfo),
						},
						{
							name: "Mutators",
							value: record.matchInfo.mutators.join("\n") ?? "Nothing",
						},
						{
							name: `Players (${record.userStats.length}/6)`,
							value: `${getPlayersInfo(record.userStats)}\n\n[View Details](https://cd-record-leaderboard.vercel.app/records/${record.id})`,
						},
					],
					timestamp: record.matchInfo.timeStamp,
				},
			],
		};

		console.log("Payload to be sent to Discord:", JSON.stringify(payload, null, 2));

		await this.discordWebhookClient.sendDiscordWebhook(this.context.domain.config.recordWebhookURL, payload);
	}

	private async notifyError(error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : isObject(error) ? JSON.stringify(error) : String(error);

		const payload: Payload = {
			embeds: [
				{
					title: "CD EAPI Error",
					description: errorMessage,
					color: 0xff0000,
				},
			],
		};

		await this.discordWebhookClient.sendDiscordWebhook(this.context.domain.config.notificationWebhookURL, payload);
	}
}
