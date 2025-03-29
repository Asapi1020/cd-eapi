import type { MatchRecord, Record, UserRecord } from "../../domain";

export const toRecordsForFrontend = (
	matchRecords: MatchRecord[],
	userRecords: UserRecord[],
): Record[] => {
	const records: Record[] = matchRecords.map((matchRecord) => {
		const userStats = userRecords.filter(
			(userRecord) => userRecord.recordID === matchRecord.recordID,
		);
		return {
			id: matchRecord.recordID,
			matchInfo: {
				timeStamp: matchRecord.timeStamp.toISOString(),
				mapName: matchRecord.mapName,
				serverName: matchRecord.serverName,
				serverIP: matchRecord.serverIP,
				isVictory: matchRecord.isVictory,
				defeatWave: matchRecord.defeatWave,
				cheatMessages: matchRecord.cheatMessages,
				mutators: matchRecord.mutators,
				isSolo: matchRecord.isSolo,
				CDInfo: matchRecord.CDInfo,
			},
			userStats: userStats.map((userRecord) => ({
				playerName: userRecord.playerName,
				steamID: userRecord.steamID,
				perkClass: userRecord.perkClass,
				playTime: userRecord.playTime,
				damageDealt: userRecord.damageDealt,
				damageTaken: userRecord.damageTaken,
				healsGiven: userRecord.healsGiven,
				healsReceived: userRecord.healsReceived,
				doshEarned: userRecord.doshEarned,
				shotsFired: userRecord.shotsFired,
				shotsHit: userRecord.shotsHit,
				headShots: userRecord.headShots,
				deaths: userRecord.deaths,
				weaponDamages: userRecord.weaponDamages.map((weaponDamage) => ({
					weaponDefClass: weaponDamage.weaponDefClass,
					damageAmount: weaponDamage.damageAmount,
					headShots: weaponDamage.headShots,
					largeZedKills: weaponDamage.largeZedKills,
				})),
				zedKills: userRecord.zedKills.map((zedKill) => ({
					zedClass: zedKill.zedClass,
					killCount: zedKill.killCount,
				})),
			})),
		};
	});
	return records;
};
