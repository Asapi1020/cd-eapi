export function convertSteam32To64ID(steam32ID: string): string {
	const steam32IDBigInt = BigInt(Number.parseInt(steam32ID));
	const steam64IDBigInt = steam32IDBigInt + BigInt(76561197960265728);
	const steam64ID = steam64IDBigInt.toString();
	return steam64ID;
}
