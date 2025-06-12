import type { Context } from "./Context";
import { DiscordWebhookClient } from "./DiscordWebhookClient";
import { MongoDB } from "./MongoDB";
import { SteamAPIClient } from "./SteamAPIClient";

export class Infra {
	public mongoDB: MongoDB;
	public steamAPIClient: SteamAPIClient;
	public discordWebhookClient: DiscordWebhookClient;

	constructor(context: Context) {
		this.mongoDB = new MongoDB(context);
		this.steamAPIClient = new SteamAPIClient(context);
		this.discordWebhookClient = new DiscordWebhookClient();
	}
}
