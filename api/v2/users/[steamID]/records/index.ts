import { toString as convertToString } from "@asp1020/type-utils";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { throwInvalidParamerterError } from "../../../../../src/domain";
import { Client } from "../../../../../src/framework";
import { MongoDB } from "../../../../../src/infra";
import { toGetMatchRecordsParams, toRecordsForFrontend } from "../../../../../src/interface-adapters/record";
import { RecordUsecase } from "../../../../../src/usecase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getRecords(req, res);
	}

	return res.status(405).json({ message: "Method Not Allowed" });
}

const getRecords = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
	try {
		const param = toGetMatchRecordsParams(req.query);
		const steamID = convertToString(req.query.steamID) ?? throwInvalidParamerterError("steamID");
		const client = await Client.mongo();
		const usecase = new RecordUsecase(new MongoDB(client));
		const [matchRecords, userRecords, total] = await usecase.getUsersRecords(param, steamID);
		const records = toRecordsForFrontend(matchRecords, userRecords);
		return res.status(200).json({ records, total });
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
};
