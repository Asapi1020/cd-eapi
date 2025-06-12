import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BadRequestError } from "../../src/domain";
import { createContext } from "../../src/frameworks";
import { toGetRecordsParams, toPostRecordParams } from "../../src/interface-adapters/record";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getRecords(req, res);
	}

	if (req.method === "POST") {
		const userAgent = req.headers["user-agent"];

		if (!userAgent || userAgent.split(",")[0] !== "UE3-KF") {
			return res.status(401).json({ message: "Unauthorized" });
		}

		return await postRecords(req, res);
	}
	return res.status(405).json({ message: "Method Not Allowed" });
}

const getRecords = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
	try {
		const context = await createContext();

		const params = toGetRecordsParams(req.query);
		const [records, total] = await context.usecases.recordUsecase.getRecords(params);

		return res.status(200).json({ data: records, total });
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
