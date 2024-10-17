import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Client, MongoDB } from "../../src/database";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	const userAgent = req.headers["user-agent"];
	if (!userAgent || userAgent.split(",")[0] !== "UE3-KF") {
		return res.status(401).json({ message: "Unauthorized" });
	}

	if (req.method === "POST") {
		return await postRecords(req, res);
	}
	return res.status(405).json({ message: "Method Not Allowed" });
}

const postRecords = async (
	req: VercelRequest,
	res: VercelResponse,
): Promise<VercelResponse> => {
	const { body } = req;
	console.log(body);

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
