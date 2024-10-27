import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Client, MongoDB } from "../../src/database";

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
	res.setHeader("Access-Control-Allow-Origin", "http://localhost/5173");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET,OPTIONS,PATCH,DELETE,POST,PUT",
	);
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
	);

	const { page } = req.query;
	console.log({ page });
	const pageNum =
		typeof page !== "string" || !page ? 1 : Math.max(Number.parseInt(page), 1);
	console.log(pageNum);
	try {
		const client = await Client.mongo();
		const model = new MongoDB(client);
		const records = await model.getRecords(pageNum);
		return res.status(200).json({ data: records });
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
		const client = await Client.mongo();
		const model = new MongoDB(client);
		await model.postRecord(body);
		return res.status(200).json({ message: "Successfully post record" });
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
};
