import type { MatchInfo, UserStats } from "./Model";

export interface PostRecordRequest {
	matchInfo: MatchInfo;
	userStats: UserStats[];
}
