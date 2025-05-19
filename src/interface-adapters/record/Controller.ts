import { toString as convertToString, isArray, isObject, toBoolean, toNumber } from "@asp1020/type-utils";
import {
	BadRequestError,
	type CDInfo,
	type GetMatchRecordsParams,
	type MatchInfo,
	type PostRecordRequest,
	type UserStats,
	type WeaponDamage,
	type ZedKillType,
	type getRecordsParams,
	throwInvalidParameterError,
} from "../../domain";

export const toGetRecordsParams = (query: unknown): getRecordsParams => {
	if (!isObject(query)) {
		throw new BadRequestError("Invalid parameter: query must be an object");
	}
	const page = toNumber(query.page) ?? 1;
	const isVictory = query.isVictory === "1";
	const steamID = convertToString(query.steamID);
	const isAll = query.isAll === "1";

	return { page: Math.max(page, 1), isVictory, steamID, isAll };
};

export const toGetMatchRecordsParams = (query: unknown): GetMatchRecordsParams => {
	if (!isObject(query)) {
		throw new BadRequestError("Invalid parameter: query must be an object");
	}
	const page = toNumber(query.page) ?? 1;
	const isVictory = toBoolean(query.isVictory);
	return { page: Math.max(page, 1), isVictory };
};

export const toPostRecordParams = (body: unknown): PostRecordRequest => {
	if (!isObject(body)) {
		throw new BadRequestError("Invalid parameter: body must be an object");
	}
	const matchInfo = body.matchInfo;
	const userStats = body.userStats;
	if (!isArray(userStats)) {
		throw new BadRequestError("Invalid parameter: userStats must be an array");
	}
	return {
		matchInfo: toMatchInfo(matchInfo),
		userStats: userStats.map(toUserStats),
	};
};

export const toMatchInfo = (data: unknown): Omit<MatchInfo, "timeStamp"> => {
	if (!isObject(data)) {
		throw new BadRequestError("Invalid parameter: data must be an object");
	}
	return {
		mapName: convertToString(data.mapName) ?? throwInvalidParameterError("mapName"),
		serverName: convertToString(data.serverName),
		serverIP: convertToString(data.serverIP) ?? throwInvalidParameterError("serverIP"),
		isVictory: toBoolean(data.isVictory) ?? throwInvalidParameterError("isVictory"),
		defeatWave: toNumber(data.defeatWave) ?? throwInvalidParameterError("defeatWave"),
		cheatMessages: isArray(data.cheatMessages)
			? data.cheatMessages.map((message: unknown) => convertToString(message))
			: [],
		mutators: isArray(data.mutators) ? data.mutators.map((mutator: unknown) => convertToString(mutator)) : [],
		isSolo: toBoolean(data.isSolo) ?? throwInvalidParameterError("isSolo"),
		CDInfo: toCDInfo(data.CDInfo),
	};
};

export const toCDInfo = (data: unknown): CDInfo => {
	if (!isObject(data)) {
		throw new BadRequestError("Invalid parameter: data must be an object");
	}
	return {
		spawnCycle: convertToString(data.spawnCycle) ?? throwInvalidParameterError("spawnCycle"),
		maxMonsters: toNumber(data.maxMonsters) ?? throwInvalidParameterError("maxMonsters"),
		cohortSize: toNumber(data.cohortSize) ?? throwInvalidParameterError("cohortSize"),
		spawnPoll: toNumber(data.spawnPoll) ?? throwInvalidParameterError("spawnPoll"),
		waveSizeFakes: toNumber(data.waveSizeFakes) ?? throwInvalidParameterError("waveSizeFakes"),
		spawnMod: toNumber(data.spawnMod) ?? throwInvalidParameterError("spawnMod"),
		trashHPFakes: toNumber(data.trashHPFakes) ?? throwInvalidParameterError("trashHPFakes"),
		QPHPFakes: toNumber(data.QPHPFakes) ?? throwInvalidParameterError("QPHPFakes"),
		FPHPFakes: toNumber(data.FPHPFakes) ?? throwInvalidParameterError("FPHPFakes"),
		SCHPFakes: toNumber(data.SCHPFakes) ?? throwInvalidParameterError("SCHPFakes"),
		ZTSpawnMode: convertToString(data.ZTSpawnMode) ?? throwInvalidParameterError("ZTSpawnMode"),
		ZTSpawnSlowDown: toNumber(data.ZTSpawnSlowDown) ?? throwInvalidParameterError("ZTSpawnSlowDown"),
		albinoAlphas: toBoolean(data.albinoAlphas) ?? throwInvalidParameterError("albinoAlphas"),
		albinoCrawlers: toBoolean(data.albinoCrawlers) ?? throwInvalidParameterError("albinoCrawlers"),
		albinoGorefasts: toBoolean(data.albinoGorefasts) ?? throwInvalidParameterError("albinoGorefasts"),
		disableRobots: toBoolean(data.disableRobots) ?? throwInvalidParameterError("disableRobots"),
		disableSpawners: toBoolean(data.disableSpawners) ?? throwInvalidParameterError("disableSpawners"),
		fleshpoundRageSpawns: toBoolean(data.fleshpoundRageSpawns) ?? throwInvalidParameterError("fleshpoundRageSpawns"),
		startWithFullAmmo: toBoolean(data.startWithFullAmmo) ?? throwInvalidParameterError("startWithFullAmmo"),
		startWithFullArmor: toBoolean(data.startWithFullArmor) ?? throwInvalidParameterError("startWithFullArmor"),
		startWithFullGrenade: toBoolean(data.startWithFullGrenade) ?? throwInvalidParameterError("startWithFullGrenade"),
		zedsTeleportCloser: toBoolean(data.zedsTeleportCloser) ?? throwInvalidParameterError("zedsTeleportCloser"),
	};
};

export const toUserStats = (data: unknown): UserStats => {
	if (!isObject(data)) {
		throw new BadRequestError("Invalid parameter: data must be an object");
	}
	return {
		playerName: convertToString(data.playerName),
		steamID: convertToString(data.steamID) ?? throwInvalidParameterError("steamID"),
		perkClass: convertToString(data.perkClass) ?? throwInvalidParameterError("perkClass"),
		playTime: toNumber(data.playTime) ?? throwInvalidParameterError("playTime"),
		damageDealt: toNumber(data.damageDealt) ?? throwInvalidParameterError("damageDealt"),
		damageTaken: toNumber(data.damageTaken) ?? throwInvalidParameterError("damageTaken"),
		healsGiven: toNumber(data.healsGiven) ?? throwInvalidParameterError("healsGiven"),
		healsReceived: toNumber(data.healsReceived) ?? throwInvalidParameterError("healsReceived"),
		doshEarned: toNumber(data.doshEarned) ?? throwInvalidParameterError("doshEarned"),
		shotsFired: toNumber(data.shotsFired) ?? throwInvalidParameterError("shotsFired"),
		shotsHit: toNumber(data.shotsHit) ?? throwInvalidParameterError("shotsHit"),
		headShots: toNumber(data.headShots) ?? throwInvalidParameterError("headShots"),
		deaths: toNumber(data.deaths) ?? throwInvalidParameterError("deaths"),
		weaponDamages: isArray(data.weaponDamages) ? data.weaponDamages.map(toWeaponDamage) : [],
		zedKills: isArray(data.zedKills) ? data.zedKills.map(toZedKillType) : [],
	};
};

export const toWeaponDamage = (data: unknown): WeaponDamage => {
	if (!isObject(data)) {
		throw new BadRequestError("Invalid parameter: data must be an object");
	}
	return {
		weaponDefClass: convertToString(data.weaponDefClass) ?? throwInvalidParameterError("weaponDefClass"),
		damageAmount: toNumber(data.damageAmount) ?? throwInvalidParameterError("damageAmount"),
		headShots: toNumber(data.headShots) ?? throwInvalidParameterError("headShots"),
		largeZedKills: toNumber(data.largeZedKills) ?? throwInvalidParameterError("largeZedKills"),
	};
};

export const toZedKillType = (data: unknown): ZedKillType => {
	if (!isObject(data)) {
		throw new BadRequestError("Invalid parameter: data must be an object");
	}
	return {
		zedClass: convertToString(data.zedClass) ?? throwInvalidParameterError("zedClass"),
		killCount: toNumber(data.killCount) ?? throwInvalidParameterError("killCount"),
	};
};
