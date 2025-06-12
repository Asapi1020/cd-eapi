import { throwInternalServerError } from "./ErrorHandler";

export class Config {
	public get mongoURI(): string {
		return process.env.MONGO_DB_URI ?? throwInternalServerError("There is no Mongo URI");
	}

	public get steamAPIKey(): string {
		return process.env.STEAM_API_KEY ?? throwInternalServerError("There is no Steam API key");
	}

	public get dbName(): string {
		return process.env.DB_NAME ?? throwInternalServerError("There is no database name");
	}

	public get recordWebhookURL(): string {
		return process.env.DISCORD_WEBHOOK_URL ?? throwInternalServerError("There is no record webhook URL");
	}

	public get notificationWebhookURL(): string {
		return process.env.NOTIFICATION_URL ?? throwInternalServerError("There is no notification webhook URL");
	}
}
