export interface DiscordWebhookPayload {
	content?: string;
	embeds?: {
		author?: {
			name: string | null | undefined;
			url?: string | null | undefined;
			icon_url?: string | null | undefined;
		};
		title: string | null | undefined;
		url?: string | null | undefined;
		description: string | null | undefined;
		image?: {
			url: string | null | undefined;
		};
		color?: number;
		timestamp?: string | null | undefined;
		fields?: {
			name: string | null | undefined;
			value: string | null | undefined;
			inline?: boolean;
		}[];
	}[];
}
