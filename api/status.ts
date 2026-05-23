import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
	console.log(req.headers["user-agent"]);

	const accessToken = req.headers["eapi-access-token"];
	const expectedToken = process.env.EAPI_ACCESS_TOKEN;

	if (!expectedToken) {
		console.error("There is no EAPI access token");
	}

	if (!accessToken || accessToken !== expectedToken) {
		console.error("Unauthorized access attempt");
	}

	res.status(200).json({ status: "OK" });
}
