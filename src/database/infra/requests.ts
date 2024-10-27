import type { MatchInfo, UserStats } from "./model";

export interface PostRecordRequest {
	matchInfo: MatchInfo;
	userStats: UserStats[];
}
