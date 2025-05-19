import { toString as convertToString } from "@asp1020/type-utils";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BadRequestError, throwInvalidParameterError } from "../../../src/domain";
import { Client } from "../../../src/framework";
import { MongoDB } from "../../../src/infra";
import { RecordUsecase } from "../../../src/usecase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getRecord(req, res);
	}
	return res.status(405).json({ message: "Method Not Allowed" });
}

const getRecord = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
	try {
		const recordID = convertToString(req.query.recordID) ?? throwInvalidParameterError("recordID");

		const client = await Client.mongo();
		const usecase = new RecordUsecase(new MongoDB(client));
		const record = await usecase.getRecordByID(recordID);
		if (!record) {
			return res.status(404).json({ message: "record not found" });
		}
		return res.status(200).json({ data: record });
	} catch (error) {
		console.error(error);
		if (error instanceof BadRequestError) {
			return res.status(400).json({ message: error.message });
		}
		return res.status(500).json(error);
	}
};
