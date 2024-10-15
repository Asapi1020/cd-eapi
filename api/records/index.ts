import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "POST") {
		const { body } = req;
		return res.status(200).json({ message: "Data received", data: body });
	}
	return res.status(405).json({ message: "Method Not Allowed" });
}
