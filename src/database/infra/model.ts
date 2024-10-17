export interface MatchInfo {
	id?: string;
	timeStamp: string;
	mapName: string;
	serverName: string;
	serverIP: string;
	isVictory: boolean;
	defeatWave: number;
	cheatMessages: string[];
	mutators: string[];
	isSolo: boolean;
	CDInfo: CDInfo;
}

export interface CDInfo {
	spawnCycle: string;
	maxMonsters: number;
	cohortSize: number;
	spawnPoll: number;
	waveSizeFakes: number;
	spawnMod: number;
	trashHPFakes: number;
	QPHPFakes: number;
	FPHPFakes: number;
	SCHPFakes: number;
	ZTSpawnMode: string;
	ZTSpawnSlowDown: number;
	albinoAlphas: boolean;
	albinoCrawlers: boolean;
	albinoGorefasts: boolean;
	disableRobots: boolean;
	disableSpawners: boolean;
	fleshpoundRageSpawns: boolean;
	startWithFullAmmo: boolean;
	startWithFullArmor: boolean;
	startWithFullGrenade: boolean;
	zedsTeleportCloser: boolean;
}

export interface UserStats {
	playerName: string;
	steamID: string;
	perkClass: string;
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
	weaponDamages: WeaponDamage[];
	zedKills: ZedKillType[];
	matchID?: string;
}

export interface WeaponDamage {
	weaponDefClass: string;
	damageAmount: number;
	headShots: number;
	largeZedKills: number;
}

export interface ZedKillType {
	zedClass: string;
	killCount: number;
}

export interface User {
	id: string;
	name: string;
	steamID: string;
}
