import { GameDig, type QueryResult } from "gamedig";
import { type SteamUser, throwInternalServerError } from "../domain";
import { toSteamUser } from "../interface-adapters/player";
import type { Context } from "./Context";

export class SteamAPIClient {
	private context: Context;

	constructor(context: Context) {
		this.context = context;
	}

	private get key(): string {
		return this.context.domain.config.steamAPIKey;
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
			throw new Error(`Failed to fetch player summaries - ${response.statusText} (${response.status})`);
		}

		const data = await response.json();
		return toSteamUser(data) ?? throwInternalServerError("Failed to parse player data");
	}
}
