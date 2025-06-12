import { MongoClient } from "mongodb";

export const mongo = async (mongoURI: string): Promise<MongoClient> => {
	const client = new MongoClient(mongoURI);
	return client.connect();
};
