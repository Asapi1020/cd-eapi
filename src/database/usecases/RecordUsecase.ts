import type { MongoDB, PostRecordRequest } from "../infra";

export const post = async (model: MongoDB, body: PostRecordRequest) => {
	console.log("process post");
};
