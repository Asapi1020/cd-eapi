import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BadRequestError } from "../../src/domain";
import { Client } from "../../src/framework";
import { MongoDB } from "../../src/infra";
import {
	toGetRecordsParams,
	toPostRecordParams,
} from "../../src/interface-adapters/record";
import { RecordUsecase } from "../../src/usecase";
import { notifyError } from "../../src/usecase/ErrorHandler";

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

const getRecords = async (
	req: VercelRequest,
	res: VercelResponse,
): Promise<VercelResponse> => {
	try {
		const params = toGetRecordsParams(req.query);
		const client = await Client.mongo();
		const usecase = new RecordUsecase(new MongoDB(client));
		const [records, total] = await usecase.getRecords(params);
		return res.status(200).json({ data: records, total });
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
};

const postRecords = async (
	req: VercelRequest,
	res: VercelResponse,
): Promise<VercelResponse> => {
	try {
		const client = await Client.mongo();
		const usecase = new RecordUsecase(new MongoDB(client));
		await usecase.postRecord(toPostRecordParams(req.body));
		return res.status(200).json({ message: "Successfully post record" });
	} catch (error) {
		console.error(error);
		await notifyError(error).catch(console.error);
		if (error instanceof BadRequestError) {
			return res.status(400).json({ message: error.message });
		}
		return res.status(500).json(error);
	}
};
