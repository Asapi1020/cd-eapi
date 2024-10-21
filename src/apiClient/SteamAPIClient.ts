export class SteamAPIClient {
	private key: string;

	constructor() {
		if (!process.env.STEAM_API_KEY) {
			throw new Error("Steam API key is undefined");
		}

		this.key = process.env.STEAM_API_KEY;
	}

	public async getServerInfo(address: string) {
		console.log({ address, key: this.key });
		const response = await fetch(
			`http://api.steampowered.com/ISteamApps/GetServersAtAddress/v0001?addr=${address}&key=${this.key})`,
		);

		if (!response.ok) {
			throw new Error("Response is not ok");
		}

		const data = await response.json();
		return data;
	}
}
