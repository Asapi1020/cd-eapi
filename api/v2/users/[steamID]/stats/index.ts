import { toString as convertToString } from "@asp1020/type-utils";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { throwInvalidParameterError } from "../../../../../src/domain";
import { createContext } from "../../../../../src/frameworks";
import { toUserStats } from "../../../../../src/interface-adapters/record";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getStats(req, res);
	}

	return res.status(405).json({ message: "Method Not Allowed" });
}

const getStats = async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse> => {
	try {
		const context = await createContext();

		const steamID = convertToString(req.query.steamID) ?? throwInvalidParameterError("steamID");
		const userRecords = await context.usecases.recordUsecase.getUserStats(steamID);
		const stats = userRecords.map(toUserStats);

		return res.status(200).json({ stats });
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
};
