import type { Collection, Db, Filter, MongoClient } from "mongodb";
import type { GetMatchRecordsParams, getRecordsParams } from "../domain";
import type { MatchRecord, Record, UserRecord } from "../domain/model";
import { toMatchRecordsFromRaw } from "../interface-adapters/record";

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

	public async getMatchRecordByID(recordID: string): Promise<MatchRecord> {
		return await this.collection.matchRecord.findOne({ recordID });
	}

	public async getMatchRecordsByID(
		recordIDs: string[],
	): Promise<MatchRecord[]> {
		return await this.collection.matchRecord
			.find({
				recordID: { $in: recordIDs },
			})
			.toArray();
	}

	public async getMatchRecords(
		params: GetMatchRecordsParams,
	): Promise<[MatchRecord[], number]> {
		const skip = (params.page - 1) * PER_PAGE;
		const filter: Filter<MatchRecord> = params.isVictory
			? { isVictory: true }
			: {};

		const total = await this.collection.matchRecord.countDocuments(filter);
		const query = this.collection.matchRecord
			.find(filter)
			.sort({ timeStamp: -1 });
		const matchRecords = await query.skip(skip).limit(PER_PAGE).toArray();

		return [matchRecords, total];
	}

	public async postRecord(record: Record): Promise<void> {
		console.log(record);
		await this.collection.record.insertOne(record);
	}

	public async postMatchRecord(matchRecord: MatchRecord): Promise<void> {
		await this.collection.matchRecord.insertOne(matchRecord);
	}

	public async getUserRecordsByRecordIDs(
		recordIDs: string[],
	): Promise<UserRecord[]> {
		const userRecords = await this.collection.userRecord
			.find({ recordID: { $in: recordIDs } })
			.toArray();
		return userRecords;
	}

	public async getUserRecordsBySteamID(steamID: string): Promise<UserRecord[]> {
		const userRecords = await this.collection.userRecord
			.find({ steamID })
			.toArray();
		return userRecords;
	}

	public async getUsersMatchRecordsBySteamID(
		param: GetMatchRecordsParams,
		steamID: string,
	): Promise<[MatchRecord[], number]> {
		const victoryFilter =
			param.isVictory !== undefined
				? [{ $match: { "matchData.isVictory": true } }]
				: [];
		const pipeline = [
			{
				$match: {
					steamID,
				},
			},
			{
				$lookup: {
					from: "matchRecord",
					localField: "recordID",
					foreignField: "recordID",
					as: "matchData",
				},
			},
			{ $unwind: "$matchData" },
			...victoryFilter,
		];
		const rawTotal = await this.collection.userRecord
			.aggregate([...pipeline, { $count: "totalCount" }])
			.toArray();
		const total = rawTotal.length > 0 ? rawTotal[0].totalCount : 0;
		const rawData = await this.collection.userRecord
			.aggregate([
				...pipeline,
				{ $sort: { "matchData.timeStamp": -1 } },
				{ $skip: (param.page - 1) * PER_PAGE },
				{ $limit: PER_PAGE },
			])
			.toArray();

		return [toMatchRecordsFromRaw(rawData), total];
	}

	public async postUserRecords(userRecords: UserRecord[]): Promise<void> {
		await this.collection.userRecord.insertMany(userRecords);
	}
}
