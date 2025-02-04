import type { DiscordWebhookPayload } from "../domain/discord";

export async function sendDiscordWebhook(
	url: string,
	payload: DiscordWebhookPayload,
) {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		console.error("Failed to send Discord Webhook", response.statusText);
	}
}
