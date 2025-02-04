import { createId as cuid } from "@paralleldrive/cuid2";
import type { PostRecordRequest, Record } from "../domain";
import { Client, SteamAPIClient } from "../framework";
import { MongoDB, VERSION } from "../infra";

export async function postRecord(request: PostRecordRequest): Promise<void> {
	const record = await postRequestToRecord(request);
	const client = await Client.mongo();
	const db = new MongoDB(client);
	await db.postRecord(record);
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
