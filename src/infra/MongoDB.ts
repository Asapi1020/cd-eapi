import type { Collection, Db, MongoClient } from "mongodb";
import type { getRecordsParams } from "../domain";
import type { Record, User } from "../domain/model";

export const VERSION = "2.0.0";
const PER_PAGE = 20;

export interface Table {
	record: Collection<Record>;
	user: Collection<User>;
}

export class MongoDB {
	private db: Db;
	private collection: Table;

	public constructor(client: MongoClient) {
		this.db = client.db(process.env.DB_NAME);
		this.collection = {
			record: this.db.collection("record"),
			user: this.db.collection("user"),
		};
	}

	public async getRecord(id: string): Promise<Record | null> {
		return await this.collection.record.findOne({ id });
	}

	public async getRecords(
		params: getRecordsParams,
	): Promise<[Record[], number]> {
		const { page, isVictory, steamID } = params;
		const skip = (page - 1) * PER_PAGE;
		const filter = { version: VERSION };

		if (isVictory) {
			filter["matchInfo.isVictory"] = true;
		}

		if (steamID) {
			filter["userStats.steamID"] = steamID;
		}

		const total = await this.collection.record.countDocuments(filter);

		const records = await this.collection.record
			.find(filter)
			.sort({ _id: -1 })
			.skip(skip)
			.limit(PER_PAGE)
			.toArray();
		return [records, total];
	}

	public async postRecord(record: Record): Promise<void> {
		console.log(record);
		await this.collection.record.insertOne(record);
	}
}
