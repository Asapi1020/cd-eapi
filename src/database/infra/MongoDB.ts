import { createId as cuid } from "@paralleldrive/cuid2";
import type { Collection, Db, MongoClient } from "mongodb";
import type { MatchInfo, User, UserStats } from "./Model";

export interface Table {
	matchInfo: Collection<MatchInfo>;
	userStats: Collection<UserStats>;
	user: Collection<User>;
}

export class MongoDB {
	private db: Db;
	private collection: Table;

	public constructor(client: MongoClient) {
		this.db = client.db(process.env.DB_NAME);
		this.collection = {
			matchInfo: this.db.collection("matchInfo"),
			userStats: this.db.collection("userStats"),
			user: this.db.collection("user"),
		};
	}

	/**
	 * @param matchInfo
	 * @returns matchID
	 */
	public async postMatchInfo(
		matchInfo: MatchInfo,
	): Promise<string | undefined> {
		try {
			const matchID = cuid();
			const matchInfoWithID: MatchInfo = {
				...matchInfo,
				id: matchID,
			};
			await this.collection.matchInfo.insertOne(matchInfoWithID);
			return matchID;
		} catch (error) {
			throw new Error(error);
		}
	}

	public async postUserStats(userStats: UserStats[]) {
		try {
			await this.collection.userStats.insertMany(userStats);
		} catch (error) {
			throw new Error(error);
		}
	}
}
