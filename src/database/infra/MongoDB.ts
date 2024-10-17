import type { Collection, Db, MongoClient } from "mongodb";

export interface Table {
	matchInfo: Collection<Document>;
	userStats: Collection<Document>;
	user: Collection<Document>;
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
}
