import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SteamAPIClient } from "../../src/framework";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getPlayers(req, res);
	}

	return res.status(405).json({ message: "Method Not Allowed" });
}

const getPlayers = async (req: VercelRequest, res: VercelResponse) => {
	try {
		const { id } = req.query;
		const ids = typeof id === "string" ? [id] : id;

		const steamAPIClient = new SteamAPIClient();
		const data = await steamAPIClient.getPlayerSummaries(ids);
		return res.status(200).json(data);
	} catch (error) {
		return res.status(500).json(error);
	}
};
