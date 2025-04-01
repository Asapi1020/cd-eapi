import type { Payload } from "@asp1020/discord-webhook-client";
import { createId as cuid } from "@paralleldrive/cuid2";
import type { QueryResult } from "gamedig";
import type {
	CDInfo,
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
import { defaultMapImage, mapData } from "../domain/mapData";
import { perkData } from "../domain/perkData";
import { SteamAPIClient } from "../framework";
import { sendDiscordWebhook } from "../framework/discordWebhookClient";
import { type MongoDB, VERSION } from "../infra";
import { notifyError } from "./ErrorHandler";

export class RecordUsecase {
	constructor(private db: MongoDB) {
		this.db = db;
	}

	public async getRecords(
		params: getRecordsParams,
	): Promise<[Record[], number]> {
		return await this.db.getRecords(params);
	}

	public async getRecordsV2(
		params: GetMatchRecordsParams,
	): Promise<[MatchRecord[], UserRecord[], number]> {
		const [matchRecords, total] = await this.db.getMatchRecords(params);
		const userRecords = await this.db.getUserRecordsByRecordIDs(
			matchRecords.map((record) => record.recordID),
		);
		return [matchRecords, userRecords, total];
	}

	public async getRecordByID(id: string): Promise<Record | null> {
		return await this.db.getRecord(id);
	}

	public async getRecordByIDV2(
		recordID: string,
	): Promise<[MatchRecord, UserRecord[]] | undefined> {
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
		const [matchRecords, total] = await this.db.getUsersMatchRecordsBySteamID(
			param,
			steamID,
		);
		const userRecords = await this.db.getUserRecordsByRecordIDs(
			matchRecords.map((record) => record.recordID),
		);
		return [matchRecords, userRecords, total];
	}

	public async getUserStats(steamID: string): Promise<UserRecord[]> {
		const userRecords = await this.db.getUserRecordsBySteamID(steamID);
		return userRecords;
	}

	public async postRecord(request: PostRecordRequest): Promise<void> {
		const serverName = await this.fetchServerName(
			request.matchInfo.serverIP,
		).catch(() => undefined);

		const steamUserMap = await this.getSteamUserMap(
			request.userStats.map((stat) => stat.steamID),
		).catch((error) => {
			console.error("Steam User Map Error", error);
			notifyError(error);
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
				steamID: steamUser?.id ?? this.convertSteam32To64ID(stat.steamID),
				playerName: steamUser?.name,
			};
		});

		const id = cuid();
		const record = { matchInfo, userStats, id, version: VERSION };
		await this.db
			.postRecord(record)
			.catch((error) => console.error("Post Record Error", error));

		const matchRecord = {
			...request.matchInfo,
			serverName,
			timeStamp: now,
			recordID: id,
		};
		await this.db
			.postMatchRecord(matchRecord)
			.catch((error) => console.error("Post Match Record Error", error));

		const userRecords = userStats.map((stat) => ({
			...stat,
			recordID: id,
		}));
		await this.db
			.postUserRecords(userRecords)
			.catch((error) => console.error("Post User Records Error", error));

		if (
			record.matchInfo.isVictory &&
			record.matchInfo.cheatMessages.length === 0
		) {
			await notifyRecordToDiscord(record);
		}
	}

	private async fetchServerName(serverIP: string): Promise<string | null> {
		const steamAPIClient = new SteamAPIClient();
		const serverInfo: QueryResult = await steamAPIClient
			.getServerInfo(serverIP.split(":")[0])
			.catch((error) => {
				console.log("Server Info Error", error);
				return null;
			});
		return serverInfo?.name ?? null;
	}

	private async getSteamUserMap(
		steam32IDs: string[],
	): Promise<Map<string, SteamUser>> {
		const steamIDMap = new Map(
			steam32IDs.map((id) => [id, this.convertSteam32To64ID(id)]),
		);
		const steam64IDs = Array.from(steamIDMap.values());
		const steamUsers = await new SteamAPIClient().getPlayerSummaries(
			steam64IDs,
		);
		const steamUserMap = new Map(
			steam32IDs.map((steam32ID) => {
				const steam64ID = steamIDMap.get(steam32ID);
				const steamUser = steamUsers.find((user) => user.id === steam64ID);
				return [steam32ID, steamUser];
			}),
		);
		return steamUserMap;
	}

	private convertSteam32To64ID(steam32ID: string): string {
		const steam32IDBigInt = BigInt(Number.parseInt(steam32ID));
		const steam64IDBigInt = steam32IDBigInt + BigInt(76561197960265728);
		const steam64ID = steam64IDBigInt.toString();
		return steam64ID;
	}
}

async function notifyRecordToDiscord(record: Record): Promise<void> {
	const webhookURL = process.env.DISCORD_WEBHOOK_URL;
	if (!webhookURL) {
		console.error("Discord Webhook URL is not defined");
		return;
	}

	const [mapName, mapThumbnail] = getMapInfo(record.matchInfo.mapName);

	const payload: Payload = {
		embeds: [
			{
				author: {
					name: record.matchInfo.isSolo
						? "Solo"
						: (record.matchInfo.serverName ?? record.matchInfo.serverIP),
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

	console.log(
		"Payload to be sent to Discord:",
		JSON.stringify(payload, null, 2),
	);

	await sendDiscordWebhook(webhookURL, payload);
}

export function getMapInfo(mapName: string): [string, string] {
	const lowerCaseMapName = mapName.toLowerCase();
	return mapData[lowerCaseMapName] ?? [mapName, defaultMapImage];
}

function getBasicCDInfo(info: CDInfo): string {
	return `SpawnCycle=${info.spawnCycle}\nMaxMonsters=${info.maxMonsters}\nCohortSize=${info.cohortSize}\nWaveSizeFakes=${info.waveSizeFakes}\nSpawnPoll=${info.spawnPoll}`;
}

function getStrangeSettings(info: CDInfo): string {
	return (
		`${info.spawnMod > 0 ? `SpawnMod=${info.spawnMod}\n` : ""}` +
		`${info.trashHPFakes !== 6 ? `TrashHPFakes=${info.trashHPFakes}\n` : ""}` +
		`${info.QPHPFakes !== 6 ? `QPHPFakes=${info.QPHPFakes}\n` : ""}` +
		`${info.FPHPFakes !== 6 ? `FPHPFakes=${info.FPHPFakes}\n` : ""}` +
		`${info.SCHPFakes !== 6 ? `SCHPFakes=${info.SCHPFakes}\n` : ""}` +
		`${info.albinoAlphas ? "" : "AlbinoAlphas=false\n"}` +
		`${info.albinoCrawlers ? "" : "AlbinoCrawlers=false\n"}` +
		`${info.albinoGorefasts ? "" : "AlbinoGorefasts=false\n"}` +
		`${info.disableRobots ? "" : "DisableRobots=false\n"}` +
		`${info.disableSpawners ? "" : "DisableSpawners=false\n"}` +
		`${info.fleshpoundRageSpawns ? "FleshpoundRageSpawns=true\n" : ""}` +
		`${info.startWithFullAmmo ? "" : "StartWithFullAmmo=false\n"}` +
		`${info.startWithFullArmor ? "StartWithFullArmor=true\n" : ""}` +
		`${info.startWithFullGrenade ? "" : "StartWithFullGrenade=false\n"}` +
		`ZTSpawnMode=${info.ZTSpawnMode}\n` +
		`ZTSpawnSlowDown=${info.ZTSpawnSlowDown}\n` +
		`ZedsTeleportCloser=${info.zedsTeleportCloser}`
	);
}

function getPlayersInfo(stats: UserStats[]): string {
	const sortedStats = stats.sort((a, b) =>
		a.perkClass.localeCompare(b.perkClass),
	);
	const playerNames = sortedStats.map(
		(stat) =>
			`${perkData[stat.perkClass.toLowerCase()] ?? "?"} ${stat.playerName ?? stat.steamID}`,
	);
	return playerNames.join("\n");
}
