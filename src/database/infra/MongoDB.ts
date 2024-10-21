import { createId as cuid } from "@paralleldrive/cuid2";
import type { Collection, Db, MongoClient } from "mongodb";
import type { Record, User } from "./Model";
import type { PostRecordRequest } from "./requests";

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

	public async getRecords(): Promise<Record[]> {
		return await this.collection.record.find().toArray();
	}

	public async postRecord(request: PostRecordRequest): Promise<void> {
		const record: Record = {
			...request,
			id: cuid(),
		};

		await this.collection.record.insertOne(record);
	}
}
