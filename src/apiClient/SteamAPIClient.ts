import { GameDig, type QueryResult } from "gamedig";

export class SteamAPIClient {
	private key: string;

	constructor() {
		if (!process.env.STEAM_API_KEY) {
			throw new Error("Steam API key is undefined");
		}

		this.key = process.env.STEAM_API_KEY;
	}

	public async getServerInfo(ip: string): Promise<QueryResult> {
		const serverInfo = await GameDig.query({
			type: "killingfloor2",
			host: ip,
		});
		return serverInfo;
	}

	public async getPlayerSummaries(ids: string[]) {
		const response = await fetch(
			`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${this.key}&steamids=${ids.join(",")}`,
		);

		if (!response.ok) {
			throw new Error("Failed to fetch player summaries");
		}

		const data = await response.json();
		return data;
	}
}
