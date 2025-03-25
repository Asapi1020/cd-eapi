import {
	toString as convertToString,
	isArray,
	isObject,
	toBoolean,
	toNumber,
} from "@asp1020/type-utils";
import {
	BadRequestError,
	type CDInfo,
	type MatchInfo,
	type PostRecordRequest,
	type UserStats,
	type WeaponDamage,
	type ZedKillType,
	type getRecordsParams,
	throwInvalidParamerterError,
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

export const toMatchInfo = (data: unknown): MatchInfo => {
	if (!isObject(data)) {
		throw new BadRequestError("Invalid parameter: data must be an object");
	}
	return {
		timeStamp:
			convertToString(data.timeStamp) ??
			throwInvalidParamerterError("timeStamp"),
		mapName:
			convertToString(data.mapName) ?? throwInvalidParamerterError("mapName"),
		serverName: convertToString(data.serverName),
		serverIP:
			convertToString(data.serverIP) ?? throwInvalidParamerterError("serverIP"),
		isVictory:
			toBoolean(data.isVictory) ?? throwInvalidParamerterError("isVictory"),
		defeatWave:
			toNumber(data.defeatWave) ?? throwInvalidParamerterError("defeatWave"),
		cheatMessages: isArray(data.cheatMessages)
			? data.cheatMessages.map((message: unknown) => convertToString(message))
			: [],
		mutators: isArray(data.mutators)
			? data.mutators.map((mutator: unknown) => convertToString(mutator))
			: [],
		isSolo: toBoolean(data.isSolo) ?? throwInvalidParamerterError("isSolo"),
		CDInfo: toCDInfo(data.CDInfo),
	};
};

export const toCDInfo = (data: unknown): CDInfo => {
	if (!isObject(data)) {
		throw new BadRequestError("Invalid parameter: data must be an object");
	}
	return {
		spawnCycle:
			convertToString(data.spawnCycle) ??
			throwInvalidParamerterError("spawnCycle"),
		maxMonsters:
			toNumber(data.maxMonsters) ?? throwInvalidParamerterError("maxMonsters"),
		cohortSize:
			toNumber(data.cohortSize) ?? throwInvalidParamerterError("cohortSize"),
		spawnPoll:
			toNumber(data.spawnPoll) ?? throwInvalidParamerterError("spawnPoll"),
		waveSizeFakes:
			toNumber(data.waveSizeFakes) ??
			throwInvalidParamerterError("waveSizeFakes"),
		spawnMod:
			toNumber(data.spawnMod) ?? throwInvalidParamerterError("spawnMod"),
		trashHPFakes:
			toNumber(data.trashHPFakes) ??
			throwInvalidParamerterError("trashHPFakes"),
		QPHPFakes:
			toNumber(data.QPHPFakes) ?? throwInvalidParamerterError("QPHPFakes"),
		FPHPFakes:
			toNumber(data.FPHPFakes) ?? throwInvalidParamerterError("FPHPFakes"),
		SCHPFakes:
			toNumber(data.SCHPFakes) ?? throwInvalidParamerterError("SCHPFakes"),
		ZTSpawnMode:
			convertToString(data.ZTSpawnMode) ??
			throwInvalidParamerterError("ZTSpawnMode"),
		ZTSpawnSlowDown:
			toNumber(data.ZTSpawnSlowDown) ??
			throwInvalidParamerterError("ZTSpawnSlowDown"),
		albinoAlphas:
			toBoolean(data.albinoAlphas) ??
			throwInvalidParamerterError("albinoAlphas"),
		albinoCrawlers:
			toBoolean(data.albinoCrawlers) ??
			throwInvalidParamerterError("albinoCrawlers"),
		albinoGorefasts:
			toBoolean(data.albinoGorefasts) ??
			throwInvalidParamerterError("albinoGorefasts"),
		disableRobots:
			toBoolean(data.disableRobots) ??
			throwInvalidParamerterError("disableRobots"),
		disableSpawners:
			toBoolean(data.disableSpawners) ??
			throwInvalidParamerterError("disableSpawners"),
		fleshpoundRageSpawns:
			toBoolean(data.fleshpoundRageSpawns) ??
			throwInvalidParamerterError("fleshpoundRageSpawns"),
		startWithFullAmmo:
			toBoolean(data.startWithFullAmmo) ??
			throwInvalidParamerterError("startWithFullAmmo"),
		startWithFullArmor:
			toBoolean(data.startWithFullArmor) ??
			throwInvalidParamerterError("startWithFullArmor"),
		startWithFullGrenade:
			toBoolean(data.startWithFullGrenade) ??
			throwInvalidParamerterError("startWithFullGrenade"),
		zedsTeleportCloser:
			toBoolean(data.zedsTeleportCloser) ??
			throwInvalidParamerterError("zedsTeleportCloser"),
	};
};

export const toUserStats = (data: unknown): UserStats => {
	if (!isObject(data)) {
		throw new BadRequestError("Invalid parameter: data must be an object");
	}
	return {
		playerName: convertToString(data.playerName),
		steamID:
			convertToString(data.steamID) ?? throwInvalidParamerterError("steamID"),
		perkClass:
			convertToString(data.perkClass) ??
			throwInvalidParamerterError("perkClass"),
		playTime:
			toNumber(data.playTime) ?? throwInvalidParamerterError("playTime"),
		damageDealt:
			toNumber(data.damageDealt) ?? throwInvalidParamerterError("damageDealt"),
		damageTaken:
			toNumber(data.damageTaken) ?? throwInvalidParamerterError("damageTaken"),
		healsGiven:
			toNumber(data.healsGiven) ?? throwInvalidParamerterError("healsGiven"),
		healsReceived:
			toNumber(data.healsReceived) ??
			throwInvalidParamerterError("healsReceived"),
		doshEarned:
			toNumber(data.doshEarned) ?? throwInvalidParamerterError("doshEarned"),
		shotsFired:
			toNumber(data.shotsFired) ?? throwInvalidParamerterError("shotsFired"),
		shotsHit:
			toNumber(data.shotsHit) ?? throwInvalidParamerterError("shotsHit"),
		headShots:
			toNumber(data.headShots) ?? throwInvalidParamerterError("headShots"),
		deaths: toNumber(data.deaths) ?? throwInvalidParamerterError("deaths"),
		weaponDamages: isArray(data.weaponDamages)
			? data.weaponDamages.map(toWeaponDamage)
			: [],
		zedKills: isArray(data.zedKills) ? data.zedKills.map(toZedKillType) : [],
	};
};

export const toWeaponDamage = (data: unknown): WeaponDamage => {
	if (!isObject(data)) {
		throw new BadRequestError("Invalid parameter: data must be an object");
	}
	return {
		weaponDefClass:
			convertToString(data.weaponDefClass) ??
			throwInvalidParamerterError("weaponDefClass"),
		damageAmount:
			toNumber(data.damageAmount) ??
			throwInvalidParamerterError("damageAmount"),
		headShots:
			toNumber(data.headShots) ?? throwInvalidParamerterError("headShots"),
		largeZedKills:
			toNumber(data.largeZedKills) ??
			throwInvalidParamerterError("largeZedKills"),
	};
};

export const toZedKillType = (data: unknown): ZedKillType => {
	if (!isObject(data)) {
		throw new BadRequestError("Invalid parameter: data must be an object");
	}
	return {
		zedClass:
			convertToString(data.zedClass) ?? throwInvalidParamerterError("zedClass"),
		killCount:
			toNumber(data.killCount) ?? throwInvalidParamerterError("killCount"),
	};
};
