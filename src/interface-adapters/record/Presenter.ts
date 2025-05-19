import { toString as convertToString, isArray, isDate, isObject, toBoolean, toNumber } from "@asp1020/type-utils";
import {
	type MatchInfo,
	type MatchRecord,
	type Record,
	type UserRecord,
	type UserStats,
	throwInternalServerError,
	throwInvalidParameterError,
} from "../../domain";

export const toRecordsForFrontend = (matchRecords: MatchRecord[], userRecords: UserRecord[]): Record[] => {
	const records: Record[] = matchRecords.map((matchRecord) => {
		const userStats = userRecords.filter((userRecord) => userRecord.recordID === matchRecord.recordID);
		return {
			id: matchRecord.recordID,
			matchInfo: toMatchInfoForFrontend(matchRecord),
			userStats: userStats.map(toUserStatsForFrontend),
		};
	});
	return records;
};

export const toRecordForFrontend = (matchRecords: MatchRecord, userRecords: UserRecord[]): Record => {
	return {
		id: matchRecords.recordID,
		matchInfo: toMatchInfoForFrontend(matchRecords),
		userStats: userRecords.map(toUserStatsForFrontend),
	};
};

export const toMatchInfoForFrontend = (matchRecord: MatchRecord): MatchInfo => {
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

export const toUserStatsForFrontend = (userRecord: UserRecord): UserStats => {
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

export const toMatchRecordsFromRaw = (raw: unknown): MatchRecord[] => {
	if (!isArray(raw) || !raw.every(isObject)) {
		return throwInvalidParameterError("data is not an array of object");
	}

	return raw.map((data) => {
		if (!isObject(data.matchData)) {
			return throwInternalServerError("matchData is not an object");
		}
		if (!isArray(data.matchData.cheatMessages)) {
			return throwInternalServerError("cheatMessages is not an array");
		}
		if (!isArray(data.matchData.mutators)) {
			return throwInternalServerError("mutators is not an array");
		}
		if (!isObject(data.matchData.CDInfo)) {
			return throwInternalServerError("CDInfo is not an object");
		}

		return {
			recordID: convertToString(data.recordID) ?? throwInternalServerError("recordID is not a string"),
			timeStamp: isDate(data.matchData.timeStamp)
				? data.matchData.timeStamp
				: throwInternalServerError("timeStamp is not a date"),
			mapName: convertToString(data.matchData.mapName) ?? throwInternalServerError("mapName is not a string"),
			serverName: convertToString(data.matchData.serverName),
			serverIP: convertToString(data.matchData.serverIP) ?? throwInternalServerError("serverIP is not a string"),
			isVictory: toBoolean(data.matchData.isVictory) ?? throwInternalServerError("isVictory is not a boolean"),
			defeatWave: toNumber(data.matchData.defeatWave) ?? throwInternalServerError("defeatWave is not a number"),
			cheatMessages: data.matchData.cheatMessages.map(
				(cheatMessage) => convertToString(cheatMessage) ?? throwInternalServerError("cheatMessage is not a string"),
			),
			mutators: data.matchData.mutators.map(
				(mutator) => convertToString(mutator) ?? throwInternalServerError("mutator is not a string"),
			),
			isSolo: toBoolean(data.matchData.isSolo) ?? throwInternalServerError("isSolo is not a boolean"),
			CDInfo: {
				spawnCycle:
					convertToString(data.matchData.CDInfo.spawnCycle) ?? throwInternalServerError("spawnCycle is not a string"),
				maxMonsters:
					toNumber(data.matchData.CDInfo.maxMonsters) ?? throwInternalServerError("maxMonsters is not a number"),
				cohortSize:
					toNumber(data.matchData.CDInfo.cohortSize) ?? throwInternalServerError("cohortSize is not a number"),
				spawnPoll: toNumber(data.matchData.CDInfo.spawnPoll) ?? throwInternalServerError("spawnPoll is not a number"),
				waveSizeFakes:
					toNumber(data.matchData.CDInfo.waveSizeFakes) ?? throwInternalServerError("waveSizeFakes is not a number"),
				spawnMod: toNumber(data.matchData.CDInfo.spawnMod) ?? throwInternalServerError("spawnMod is not a number"),
				trashHPFakes:
					toNumber(data.matchData.CDInfo.trashHPFakes) ?? throwInternalServerError("trashHPFakes is not a number"),
				QPHPFakes: toNumber(data.matchData.CDInfo.QPHPFakes) ?? throwInternalServerError("QPHPFakes is not a number"),
				FPHPFakes: toNumber(data.matchData.CDInfo.FPHPFakes) ?? throwInternalServerError("FPHPFakes is not a number"),
				SCHPFakes: toNumber(data.matchData.CDInfo.SCHPFakes) ?? throwInternalServerError("SCHPFakes is not a number"),
				ZTSpawnMode:
					convertToString(data.matchData.CDInfo.ZTSpawnMode) ?? throwInternalServerError("ZTSpawnMode is not a string"),
				ZTSpawnSlowDown:
					toNumber(data.matchData.CDInfo.ZTSpawnSlowDown) ??
					throwInternalServerError("ZTSpawnSlowDown is not a number"),
				albinoAlphas:
					toBoolean(data.matchData.CDInfo.albinoAlphas) ?? throwInternalServerError("albinoAlphas is not a boolean"),
				albinoCrawlers:
					toBoolean(data.matchData.CDInfo.albinoCrawlers) ??
					throwInternalServerError("albinoCrawlers is not a boolean"),
				albinoGorefasts:
					toBoolean(data.matchData.CDInfo.albinoGorefasts) ??
					throwInternalServerError("albinoGorefasts is not a boolean"),
				disableRobots:
					toBoolean(data.matchData.CDInfo.disableRobots) ?? throwInternalServerError("disableRobots is not a boolean"),
				disableSpawners:
					toBoolean(data.matchData.CDInfo.disableSpawners) ??
					throwInternalServerError("disableSpawners is not a boolean"),
				fleshpoundRageSpawns:
					toBoolean(data.matchData.CDInfo.fleshpoundRageSpawns) ??
					throwInternalServerError("fleshpoundRageSpawns is not a boolean"),
				startWithFullAmmo:
					toBoolean(data.matchData.CDInfo.startWithFullAmmo) ??
					throwInternalServerError("startWithFullAmmo is not a boolean"),
				startWithFullArmor:
					toBoolean(data.matchData.CDInfo.startWithFullArmor) ??
					throwInternalServerError("startWithFullArmor is not a boolean"),
				startWithFullGrenade:
					toBoolean(data.matchData.CDInfo.startWithFullGrenade) ??
					throwInternalServerError("startWithFullGrenade is not a boolean"),
				zedsTeleportCloser:
					toBoolean(data.matchData.CDInfo.zedsTeleportCloser) ??
					throwInternalServerError("zedsTeleportCloser is not a boolean"),
			},
		};
	});
};
