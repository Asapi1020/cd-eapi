import type {
	MatchInfo,
	MatchRecord,
	Record,
	UserRecord,
	UserStats,
} from "../../domain";

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
			matchInfo: toMatchInfo(matchRecord),
			userStats: userStats.map(toUserStats),
		};
	});
	return records;
};

export const toRecordForFrontend = (
	matchRecords: MatchRecord,
	userRecords: UserRecord[],
): Record => {
	return {
		id: matchRecords.recordID,
		matchInfo: toMatchInfo(matchRecords),
		userStats: userRecords.map(toUserStats),
	};
};

export const toMatchInfo = (matchRecord: MatchRecord): MatchInfo => {
	return {
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
	};
};

export const toUserStats = (userRecord: UserRecord): UserStats => {
	return {
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
		zedKills: userRecord.zedKills.map((zedKill) => ({
			zedClass: zedKill.zedClass,
			killCount: zedKill.killCount,
		})),
		weaponDamages: userRecord.weaponDamages.map((weaponDamage) => ({
			weaponDefClass: weaponDamage.weaponDefClass,
			damageAmount: weaponDamage.damageAmount,
			headShots: weaponDamage.headShots,
			largeZedKills: weaponDamage.largeZedKills,
		})),
	};
};
