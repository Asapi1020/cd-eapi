import type { MongoClient } from "mongodb";

export class Drivers {
	public mongoClient: MongoClient;

	constructor(mongoClient: MongoClient) {
		this.mongoClient = mongoClient;
	}
}
