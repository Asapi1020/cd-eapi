import type { Collection, Db, MongoClient } from "mongodb";
import type { getRecordsParams } from "../domain";
import type { MatchRecord, Record, UserRecord } from "../domain/model";

export const VERSION = "2.0.0";
const PER_PAGE = 20;

export interface Table {
	record: Collection<Record>;
	matchRecord: Collection<MatchRecord>;
	userRecord: Collection<UserRecord>;
}

export class MongoDB {
	private db: Db;
	private collection: Table;

	public constructor(client: MongoClient) {
		this.db = client.db(process.env.DB_NAME);
		this.collection = {
			record: this.db.collection("record"),
			matchRecord: this.db.collection("matchRecord"),
			userRecord: this.db.collection("userRecord"),
		};
	}

	public async getRecord(id: string): Promise<Record | null> {
		return await this.collection.record.findOne({ id });
	}

	public async getRecords(
		params: getRecordsParams,
	): Promise<[Record[], number]> {
		const { page, isVictory, steamID, isAll } = params;
		const skip = (page - 1) * PER_PAGE;
		const filter = { version: VERSION };

		if (isVictory) {
			filter["matchInfo.isVictory"] = true;
		}

		if (steamID) {
			filter["userStats.steamID"] = steamID;
		}

		const total = await this.collection.record.countDocuments(filter);

		const query = this.collection.record.find(filter).sort({ _id: -1 });

		const records = isAll
			? await query.toArray()
			: await query.skip(skip).limit(PER_PAGE).toArray();
		return [records, total];
	}

	public async postRecord(record: Record): Promise<void> {
		console.log(record);
		await this.collection.record.insertOne(record);
	}

	public async postMatchRecord(matchRecord: MatchRecord): Promise<void> {
		await this.collection.matchRecord.insertOne(matchRecord);
	}

	public async postUserRecords(userRecords: UserRecord[]): Promise<void> {
		await this.collection.userRecord.insertMany(userRecords);
	}
}
