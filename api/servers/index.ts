import { toString as convertToString } from "@asp1020/type-utils";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BadRequestError, throwInvalidParameterError } from "../../src/domain";
import { createContext } from "../../src/frameworks";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getServer(req, res);
	}

	return res.status(405).json({ message: "Method Not Allowed" });
}

const getServer = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
	try {
		const context = await createContext();

		const ip = convertToString(req.query.ip) ?? throwInvalidParameterError("server ip");
		const serverInfo = await context.infra.steamAPIClient.getServerInfo(ip);

		return res.status(200).json({ serverInfo });
	} catch (error) {
		if (error instanceof BadRequestError) {
			return res.status(400).json({ message: error.message });
		}

		return res.status(500).json(error);
	}
};
