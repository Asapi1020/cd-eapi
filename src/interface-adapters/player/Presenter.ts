import { toString as convertToString, isArray, isObject } from "@asp1020/type-utils";
import type { SteamUser } from "../../domain";

export const toSteamUser = (data: unknown): SteamUser[] | undefined => {
	if (!isObject(data) || !isObject(data.response) || !isArray(data.response.players)) {
		return undefined;
	}

	const players = data.response.players.map((player) => {
		if (!isObject(player)) {
			return undefined;
		}
		return {
			id: convertToString(player.steamid),
			name: convertToString(player.personaname),
			url: convertToString(player.profileurl),
			avatarHash: convertToString(player.avatarhash),
		};
	});

	return players.some((player) => !player) ? undefined : players;
};
