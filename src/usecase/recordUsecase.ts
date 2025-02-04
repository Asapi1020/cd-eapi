import { createId as cuid } from "@paralleldrive/cuid2";
import type { CDInfo, PostRecordRequest, Record } from "../domain";
import type { DiscordWebhookPayload } from "../domain/discord";
import { Client, SteamAPIClient } from "../framework";
import { sendDiscordWebhook } from "../framework/discordWebhookClient";
import { MongoDB, VERSION } from "../infra";

export async function postRecord(request: PostRecordRequest): Promise<void> {
	const record = await postRequestToRecord(request);
	const client = await Client.mongo();
	const db = new MongoDB(client);
	await db.postRecord(record);

	if (record.matchInfo.isVictory) {
		notifyRecordToDiscord(record);
	}
}

export async function postRequestToRecord(
	request: PostRecordRequest,
): Promise<Record> {
	const steamAPIClient = new SteamAPIClient();
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

	try {
		// change steamID from 32 to 64
		const ids: string[] = [];
		for (const stat of request.userStats) {
			const steam32ID = Number.parseInt(stat.steamID);
			const steam64ID = steam32ID + 76561197960265728;
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

	const record: Record = {
		...request,
		id: cuid(),
		version: VERSION,
	};

	return record;
}

export async function notifyRecordToDiscord(record: Record): Promise<void> {
	const webhookURL = process.env.DISCORD_WEBHOOK_URL;
	if (!webhookURL) {
		console.error("Discord Webhook URL is not defined");
		return;
	}

	const payload: DiscordWebhookPayload = {
		embeds: [
			{
				author: {
					name: record.matchInfo.isSolo
						? "Solo"
						: (record.matchInfo.serverName ?? record.matchInfo.serverIP),
				},
				title: record.matchInfo.mapName,
				description: getBasicCDInfo(record.matchInfo.CDInfo),
				fields: {
					name: `Players (${record.userStats.length}/6)`,
					value: record.userStats
						.map((stat) => stat.playerName ?? stat.steamID)
						.join("\n"),
				},
			},
		],
	};

	try {
		await sendDiscordWebhook(webhookURL, payload);
	} catch (error) {
		console.error("Failed to send Discord Webhook", error);
	}
}

export function getBasicCDInfo(info: CDInfo): string {
	return `SpawnCycle=${info.spawnCycle}\nMaxMonsters=${info.maxMonsters}\nCohortSize=${info.cohortSize}\nWaveSizeFakes=${info.waveSizeFakes}\nSpawnPoll=${info.spawnPoll}`;
}
