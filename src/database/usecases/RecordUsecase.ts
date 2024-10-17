import type { MongoDB, PostRecordRequest } from "../infra";

export const post = async (model: MongoDB, body: PostRecordRequest) => {
	console.log({ env: process.env.NODE_ENV });

	try {
		const matchID = await model.postMatchInfo(body.matchInfo);
		const userStatsWithMatchID = body.userStats.map((eachStats) => {
			eachStats.matchID = matchID;
			return eachStats;
		});
		await model.postUserStats(userStatsWithMatchID);
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
};
