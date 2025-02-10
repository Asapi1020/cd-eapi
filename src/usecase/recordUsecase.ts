import { createId as cuid } from "@paralleldrive/cuid2";
import type { CDInfo, PostRecordRequest, Record, UserStats } from "../domain";
import { type DiscordWebhookPayload, perkData } from "../domain/discord";
import { defaultMapImage, mapData } from "../domain/kf";
import { Client, SteamAPIClient } from "../framework";
import { sendDiscordWebhook } from "../framework/discordWebhookClient";
import { MongoDB, VERSION } from "../infra";

export async function getRecordByID(id: string): Promise<Record | null> {
	const client = await Client.mongo();
	const db = new MongoDB(client);
	return await db.getRecord(id);
}

export async function postRecord(request: PostRecordRequest): Promise<void> {
	const record = await postRequestToRecord(request);
	const client = await Client.mongo();
	const db = new MongoDB(client);
	await db.postRecord(record);

	if (
		record.matchInfo.isVictory &&
		record.matchInfo.cheatMessages.length === 0
	) {
		await notifyRecordToDiscord(record);
	}
}

async function postRequestToRecord(
	request: PostRecordRequest,
): Promise<Record> {
	const steamAPIClient = new SteamAPIClient();
	if (!request.matchInfo.isSolo) {
		try {
			// fetch server info but it seems that only servers with 7777 GamePort are visible
			const serverInfo = await steamAPIClient.getServerInfo(
				request.matchInfo.serverIP.split(":")[0],
			);
			if (serverInfo.name) {
				request.matchInfo.serverName = serverInfo.name;
			}
		} catch (error) {
			console.error("Server Info Error", error);
		}
	}

	try {
		// change steamID from 32 to 64
		const ids: string[] = [];
		for (const stat of request.userStats) {
			const steam32ID = BigInt(Number.parseInt(stat.steamID));
			const steam64ID = steam32ID + BigInt(76561197960265728);
			stat.steamID = steam64ID.toString();
			ids.push(stat.steamID);
		}

		const players = await steamAPIClient.getPlayerSummaries(ids);
		const playerMap = new Map(
			players.map((player) => [player.id, player.name]),
		);
		for (const stat of request.userStats) {
			const playerName = playerMap.get(stat.steamID);
			if (playerName) {
				stat.playerName = playerName;
			}
		}
	} catch (error) {
		console.error("Player Info Error", error);
	}

	request.matchInfo.timeStamp = new Date().toISOString();

	const record: Record = {
		...request,
		id: cuid(),
		version: VERSION,
	};

	return record;
}

async function notifyRecordToDiscord(record: Record): Promise<void> {
	const webhookURL = process.env.DISCORD_WEBHOOK_URL;
	if (!webhookURL) {
		console.error("Discord Webhook URL is not defined");
		return;
	}

	const [mapName, mapThumbnail] = getMapInfo(record.matchInfo.mapName);

	const payload: DiscordWebhookPayload = {
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
						value: getPlayersInfo(record.userStats),
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

	try {
		await sendDiscordWebhook(webhookURL, payload);
	} catch (error) {
		console.error("Failed to send Discord Webhook", error);
		console.log({ webhookURL, payload });
		await sendDiscordWebhook(webhookURL, {
			content: "Failed to send Discord Webhook",
		});
	}
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
