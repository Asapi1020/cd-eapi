import { createId as cuid } from "@paralleldrive/cuid2";
import type { Collection, Db, MongoClient } from "mongodb";
import { SteamAPIClient } from "../../apiClient/SteamAPIClient";
import type { Record, User } from "./model";
import type { PostRecordRequest } from "./requests";

const VERSION = "1.0.1";

export interface Table {
	record: Collection<Record>;
	user: Collection<User>;
}

export class MongoDB {
	private db: Db;
	private collection: Table;
	private steamAPIClient: SteamAPIClient;

	public constructor(client: MongoClient) {
		this.db = client.db(process.env.DB_NAME);
		this.collection = {
			record: this.db.collection("record"),
			user: this.db.collection("user"),
		};
		this.steamAPIClient = new SteamAPIClient();
	}

	public async getRecords(): Promise<Record[]> {
		return await this.collection.record.find({ version: VERSION }).toArray();
	}

	public async postRecord(request: PostRecordRequest): Promise<void> {
		try {
			// fetch server info but it seems that only servers with 7777 GamePort are visible
			const serverInfo = await this.steamAPIClient.getServerInfo(
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

			const players = await this.steamAPIClient.getPlayerSummaries(ids);
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

		console.log(record);

		await this.collection.record.insertOne(record);
	}
}
