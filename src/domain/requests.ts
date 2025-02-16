import type { MatchInfo, UserStats } from "./model";

export interface PostRecordRequest {
	matchInfo: MatchInfo;
	userStats: UserStats[];
}

export interface getRecordsParams {
	page: number;
	isVictory: boolean;
	steamID?: string;
}
