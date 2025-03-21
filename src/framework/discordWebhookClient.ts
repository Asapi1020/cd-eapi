import { type Payload, sendMessage } from "@asp1020/discord-webhook-client";

export async function sendDiscordWebhook(url: string, payload: Payload) {
	const response = await sendMessage(url, payload);

	if (!response.ok) {
		console.error("Failed to send Discord Webhook", response.statusText);
	}
}
