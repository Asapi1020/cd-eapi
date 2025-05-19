import { toString as convertToString } from "@asp1020/type-utils";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { throwInvalidParameterError } from "../../../../../src/domain";
import { Client } from "../../../../../src/framework";
import { MongoDB } from "../../../../../src/infra";
import { toUserStats } from "../../../../../src/interface-adapters/record";
import { RecordUsecase } from "../../../../../src/usecase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getStats(req, res);
	}

	return res.status(405).json({ message: "Method Not Allowed" });
}

const getStats = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
	try {
		const steamID = convertToString(req.query.steamID) ?? throwInvalidParameterError("steamID");
		const client = await Client.mongo();
		const usecase = new RecordUsecase(new MongoDB(client));
		const userRecords = await usecase.getUserStats(steamID);
		const stats = userRecords.map(toUserStats);
		return res.status(200).json({ stats });
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
};
