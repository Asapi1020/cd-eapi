import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
	console.log(req.headers["user-agent"]);
	res.status(200).json({ status: "OK" });
}
