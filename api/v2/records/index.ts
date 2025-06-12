import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createContext } from "../../../src/frameworks";
import { toGetMatchRecordsParams } from "../../../src/interface-adapters/record";
import { toRecordsForFrontend } from "../../../src/interface-adapters/record/Presenter";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getRecords(req, res);
	}

	return res.status(405).json({ message: "Method Not Allowed" });
}

const getRecords = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
	try {
		const context = await createContext();

		const params = toGetMatchRecordsParams(req.query);
		const [matchRecords, userRecords, total] = await context.usecases.recordUsecase.getRecordsV2(params);
		const records = toRecordsForFrontend(matchRecords, userRecords);

		return res.status(200).json({ records, total });
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
};
