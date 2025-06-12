import { type CDInfo, type UserStats, defaultMapImage, mapData, perkData } from "../domain";

export function getMapInfo(mapName: string): [string, string] {
	const lowerCaseMapName = mapName.toLowerCase();
	return mapData[lowerCaseMapName] ?? [mapName, defaultMapImage];
}

export function getBasicCDInfo(info: CDInfo): string {
	return `SpawnCycle=${info.spawnCycle}\nMaxMonsters=${info.maxMonsters}\nCohortSize=${info.cohortSize}\nWaveSizeFakes=${info.waveSizeFakes}\nSpawnPoll=${info.spawnPoll}`;
}

export function getStrangeSettings(info: CDInfo): string {
	return (
		`${info.spawnMod > 0 ? `SpawnMod=${info.spawnMod}\n` : ""}` +
		`${info.trashHPFakes !== 6 ? `TrashHPFakes=${info.trashHPFakes}\n` : ""}` +
		`${info.QPHPFakes !== 6 ? `QPHPFakes=${info.QPHPFakes}\n` : ""}` +
		`${info.FPHPFakes !== 6 ? `FPHPFakes=${info.FPHPFakes}\n` : ""}` +
		`${info.SCHPFakes !== 6 ? `SCHPFakes=${info.SCHPFakes}\n` : ""}` +
		`${info.albinoAlphas ? "" : "AlbinoAlphas=false\n"}` +
		`${info.albinoCrawlers ? "" : "AlbinoCrawlers=false\n"}` +
		`${info.albinoGorefasts ? "" : "AlbinoGorefasts=false\n"}` +
		`${info.disableRobots ? "" : "DisableRobots=false\n"}` +
		`${info.disableSpawners ? "" : "DisableSpawners=false\n"}` +
		`${info.fleshpoundRageSpawns ? "FleshpoundRageSpawns=true\n" : ""}` +
		`${info.startWithFullAmmo ? "" : "StartWithFullAmmo=false\n"}` +
		`${info.startWithFullArmor ? "StartWithFullArmor=true\n" : ""}` +
		`${info.startWithFullGrenade ? "" : "StartWithFullGrenade=false\n"}` +
		`ZTSpawnMode=${info.ZTSpawnMode}\n` +
		`ZTSpawnSlowDown=${info.ZTSpawnSlowDown}\n` +
		`ZedsTeleportCloser=${info.zedsTeleportCloser}`
	);
}

export function getPlayersInfo(stats: UserStats[]): string {
	const sortedStats = stats.sort((a, b) => a.perkClass.localeCompare(b.perkClass));
	const playerNames = sortedStats.map(
		(stat) => `${perkData[stat.perkClass.toLowerCase()] ?? "?"} ${stat.playerName ?? stat.steamID}`,
	);
	return playerNames.join("\n");
}
