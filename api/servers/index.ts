import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SteamAPIClient } from "../../src/apiClient/SteamAPIClient";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getServer(req, res);
	}

	return res.status(405).json({ message: "Method Not Allowed" });
}

const getServer = async (
	req: VercelRequest,
	res: VercelResponse,
): Promise<VercelResponse> => {
	const { ip } = req.query;
	try {
		if (!ip || typeof ip !== "string") {
			return res
				.status(400)
				.json({ error: { message: "Invalid server ip", ip } });
		}

		const steamAPIClient = new SteamAPIClient();
		const serverInfo = await steamAPIClient.getServerInfo(ip);
		return res.status(200).json({ serverInfo });
	} catch (error) {
		return res.status(500).json(error);
	}
};
