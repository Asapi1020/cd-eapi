import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRecordByID } from "../../../src/usecase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getRecord(req, res);
	}
	return res.status(405).json({ message: "Method Not Allowed" });
}

const getRecord = async (
	req: VercelRequest,
	res: VercelResponse,
): Promise<VercelResponse> => {
	try {
		const { recordID } = req.query;
		if (typeof recordID !== "string" || !recordID) {
			return res.status(400).json({ message: "invalid recordID" });
		}

		const record = await getRecordByID(recordID);
		if (!record) {
			return res.status(404).json({ message: "record not found" });
		}
		return res.status(200).json({ data: record });
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
};
