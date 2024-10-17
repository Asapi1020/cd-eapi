export interface MatchInfo {
	timeStamp: string;
	mapName: string;
	serverName: string;
	serverIP: string;
	isVictory: boolean;
	defeatWave: number;
	cheatMessages: string; // stringified string[]
	mutators: string; // stringified string[]
	isSolo: boolean;
	CDInfo: CDInfo;
}

export interface CDInfo {
	spawnCycle: string;
	maxMonsters: string;
	cohortSize: string;
	spawnPoll: string;
	waveSizeFakes: string;
	spawnMod: string;
	trashHPFakes: string;
	QPHPFakes: string;
	FPHPFakes: string;
	SCHPFakes: string;
	ZTSpawnMode: string;
	ZTSpawnSlowDown: string;
	albinoAlphas: string;
	albinoCrawlers: string;
	albinoGorefasts: string;
	disableRobots: string;
	disableSpawners: string;
	fleshpoundRageSpawns: string;
	startWithFullAmmo: string;
	startWithFullArmor: string;
	startWithFullGrenade: string;
	zedsTeleportCloser: string;
}

export interface UserStats {
	playerName: string;
	steamID: string;
	perk: string;
	playTime: number;
	damageDealt: number;
	damageTaken: number;
	healsGiven: number;
	healsReceived: number;
	doshEarned: number;
	shotsFired: number;
	shotsHit: number;
	headShots: number;
	deaths: number;
	weaponDamages: string; // stringified WeaponDamage[]
	zedKills: unknown;
}

export interface WeaponDamage {
	weaponName: string;
	damageAmount: number;
	headShots: number;
	largeZedKills: number;
}
