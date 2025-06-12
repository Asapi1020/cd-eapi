import { toString as convertToString } from "@asp1020/type-utils";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { throwInvalidParameterError } from "../../../../../src/domain";
import { createContext } from "../../../../../src/frameworks";
import { toGetMatchRecordsParams, toRecordsForFrontend } from "../../../../../src/interface-adapters/record";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getRecords(req, res);
	}

	return res.status(405).json({ message: "Method Not Allowed" });
}

const getRecords = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
	try {
		const context = await createContext();

		const param = toGetMatchRecordsParams(req.query);
		const steamID = convertToString(req.query.steamID) ?? throwInvalidParameterError("steamID");
		const [matchRecords, userRecords, total] = await context.usecases.recordUsecase.getUsersRecords(param, steamID);
		const records = toRecordsForFrontend(matchRecords, userRecords);

		return res.status(200).json({ records, total });
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
};
