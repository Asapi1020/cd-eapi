import type { MatchInfo, UserStats } from "./model";

export interface PostRecordRequest {
	matchInfo: Omit<MatchInfo, "timeStamp">;
	userStats: UserStats[];
}

export interface getRecordsParams {
	page: number;
	isVictory: boolean;
	steamID?: string;
	isAll: boolean;
}

export interface GetRecordsParamsV2 {
	page: number;
	isVictory: boolean;
}
