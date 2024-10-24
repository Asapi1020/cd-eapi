import { createId as cuid } from "@paralleldrive/cuid2";
import type { Collection, Db, MongoClient } from "mongodb";
import { SteamAPIClient } from "../../apiClient/SteamAPIClient";
import type { Record, User } from "./Model";
import type { PostRecordRequest } from "./requests";

const PER_PAGE = 20;

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

	public async getRecords(page: number): Promise<Record[]> {
		const skip = (page - 1) * PER_PAGE;
		return await this.collection.record
			.find()
			.skip(skip)
			.limit(PER_PAGE)
			.toArray();
	}

	public async postRecord(request: PostRecordRequest): Promise<void> {
		// fetch server info but it seems that only servers with 7777 GamePort are visible
		const serverInfo = await this.steamAPIClient.getServerInfo(
			request.matchInfo.serverIP.split(":")[0],
		);
		if (serverInfo.name) {
			request.matchInfo.serverName = serverInfo.name;
		}

		// fetch players???

		const record: Record = {
			...request,
			id: cuid(),
		};

		console.log(record);

		await this.collection.record.insertOne(record);
	}
}
