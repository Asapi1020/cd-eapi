export function getMapThumbnail(mapName: string): [string, string] {
	switch (mapName.toLowerCase()) {
		case "kf-bioticslab": {
			return [
				"Biotics Lab",
				"https://wiki.killingfloor2.com/images/thumb/4/43/KF2_Map_BioticsLab.png/256px-KF2_Map_BioticsLab.png",
			];
		}
		case "kf-outpost": {
			return [
				"Outpost",
				"https://wiki.killingfloor2.com/images/thumb/e/ee/KF2_Map_Outpost.png/256px-KF2_Map_Outpost.png",
			];
		}
		case "kf-burningparis": {
			return [
				"Burning Paris",
				"https://wiki.killingfloor2.com/images/thumb/d/da/KF2_Map_BurningParis.png/256px-KF2_Map_BurningParis.png",
			];
		}
		case "kf-voltermanor": {
			return [
				"Volter Manor",
				"https://wiki.killingfloor2.com/images/thumb/8/8c/KF2_Map_VolterManor.png/256px-KF2_Map_VolterManor.png",
			];
		}
		case "kf-containmentstation": {
			return [
				"Containment Station",
				"https://wiki.killingfloor2.com/images/thumb/e/e3/KF2_Map_ContainmentStation.png/256px-KF2_Map_ContainmentStation.png",
			];
		}
		case "kf-infernalrealm": {
			return [
				"Infernal Realm",
				"https://wiki.killingfloor2.com/images/thumb/c/c8/KF2_Map_InfernalRealm.png/256px-KF2_Map_InfernalRealm.png",
			];
		}
		case "kf-nuked": {
			return [
				"Nuked",
				"https://wiki.killingfloor2.com/images/thumb/a/ab/KF2_Map_Nuked.png/256px-KF2_Map_Nuked.png",
			];
		}
		case "kf-spillway": {
			return [
				"Spillway",
				"https://wiki.killingfloor2.com/images/thumb/f/fa/KF2_Map_Spillway.png/256px-KF2_Map_Spillway.png",
			];
		}
		case "kf-ashwoodasylum": {
			return [
				"Ashwood Asylum",
				"https://wiki.killingfloor2.com/images/thumb/6/6a/KF2_AshwoodAsylum_thumbnail.png/256px-KF2_AshwoodAsylum_thumbnail.png",
			];
		}
		default: {
			return [mapName, "https://i.imgur.com/KCgCnmJ.jpeg"];
		}
	}
}
