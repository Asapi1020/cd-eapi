import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BadRequestError, throwInternalServerError } from "../../../src/domain";
import { createContext } from "../../../src/frameworks";
import { toGetMatchRecordsParams, toPostRecordParams } from "../../../src/interface-adapters/record";
import { toRecordsForFrontend } from "../../../src/interface-adapters/record/Presenter";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getRecords(req, res);
	}

	if (req.method === "POST") {
		const accessToken = req.headers["eapi-access-token"];
		const expectedToken = process.env.EAPI_ACCESS_TOKEN ?? throwInternalServerError("There is no EAPI access token");

		if (!accessToken || accessToken !== expectedToken) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		return await postRecords(req, res);
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

const postRecords = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
	try {
		const context = await createContext();

		await context.usecases.recordUsecase.postRecord(toPostRecordParams(req.body));

		return res.status(200).json({ message: "Successfully post record" });
	} catch (error) {
		console.error(error);

		if (error instanceof BadRequestError) {
			return res.status(400).json({ message: error.message });
		}

		return res.status(500).json(error);
	}
};
