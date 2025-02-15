import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { getRecordsParams } from "../../src/domain";
import { Client } from "../../src/framework";
import { MongoDB } from "../../src/infra";
import { postRecord } from "../../src/usecase";

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
		const { page, isVictory } = req.query;
		const pageNum =
			typeof page !== "string" || !page
				? 1
				: Math.max(Number.parseInt(page), 1);
		const params: getRecordsParams = {
			page: pageNum,
			isVictory: isVictory === "1",
		};
		const client = await Client.mongo();
		const model = new MongoDB(client);
		const [records, total] = await model.getRecords(params);
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
	const { body } = req;

	try {
		await postRecord(body);
		return res.status(200).json({ message: "Successfully post record" });
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
};
