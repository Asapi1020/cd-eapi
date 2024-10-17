import type { MatchInfo } from "./Model";

export interface PostRecordRequest {
	matchInfo: MatchInfo;
	userStats: string; // stringified UserStats[]
}
