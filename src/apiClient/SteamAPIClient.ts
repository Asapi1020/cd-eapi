import { GameDig, type QueryResult } from "gamedig";
import type { SteamUser } from "../database";

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

	/**
	 * @param ids Steam64 ID
	 * @returns SteamUser Array
	 */
	public async getPlayerSummaries(ids: string[]): Promise<SteamUser[]> {
		const response = await fetch(
			`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${this.key}&steamids=${ids.join(",")}`,
		);

		if (!response.ok) {
			throw new Error("Failed to fetch player summaries");
		}

		const data = await response.json();
		const players: SteamUser[] = data.response.players.map((player) => {
			return {
				id: player.steamid,
				name: player.personaname,
				url: player.profileurl,
				avatarHash: player.avatarhash,
			};
		});
		return players;
	}
}
