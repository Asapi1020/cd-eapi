import { toString as convertToString } from "@asp1020/type-utils";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BadRequestError, throwInvalidParameterError } from "../../../../src/domain";
import { createContext } from "../../../../src/frameworks";
import { toRecordForFrontend } from "../../../../src/interface-adapters/record/Presenter";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getRecord(req, res);
	}
	return res.status(405).json({ message: "Method Not Allowed" });
}

const getRecord = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
	try {
		const context = await createContext();

		const recordID = convertToString(req.query.recordID) ?? throwInvalidParameterError("recordID");
		const record = await context.usecases.recordUsecase.getRecordByIDV2(recordID);

		if (!record) {
			return res.status(404).json({ message: "record not found" });
		}

		const [matchRecord, userRecords] = record;
		return res.status(200).json(toRecordForFrontend(matchRecord, userRecords));
	} catch (error) {
		console.error(error);

		if (error instanceof BadRequestError) {
			return res.status(400).json({ message: error.message });
		}

		return res.status(500).json(error);
	}
};
