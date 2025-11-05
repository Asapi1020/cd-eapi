import { toNumber } from "@asp1020/type-utils";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createContext } from "../../../src/frameworks";

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "GET") {
		return await getUsers(req, res);
	}

	return res.status(405).json({ message: "Method Not Allowed" });
}

async function getUsers(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
	try {
		const context = await createContext();

		const offset = toNumber(req.query.offset) ?? 0;
		const limit = toNumber(req.query.limit) ?? 30;

		const data = await context.usecases.recordUsecase.getUsers(offset, limit);

		return res.status(200).json({ data });
	} catch (error) {
		console.error(error);
		return res.status(500).json(error);
	}
}
