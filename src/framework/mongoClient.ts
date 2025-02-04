import { MongoClient } from "mongodb";

export const mongo = async (): Promise<MongoClient> => {
	const mongoUri = process.env.MONGO_DB_URI;

	if (!mongoUri) {
		throw new Error("There is no Mongo URI");
	}

	const client = new MongoClient(mongoUri);
	return client.connect();
};
