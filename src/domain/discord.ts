export interface DiscordWebhookPayload {
	content?: string;
	embeds?: {
		author?: {
			name: string;
			url?: string;
			icon_url?: string;
		};
		title: string;
		url?: string;
		description: string;
		image?: {
			url: string;
		};
		thumbnail?: {
			url: string;
		};
		color?: number;
		timestamp?: string;
		fields?: {
			name: string;
			value: string;
			inline?: boolean;
		}[];
	}[];
}
