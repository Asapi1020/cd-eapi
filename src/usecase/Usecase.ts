import type { Context } from "./Context";
import { RecordUsecase } from "./RecordUsecase";

export class Usecase {
	public recordUsecase: RecordUsecase;

	constructor(context: Context) {
		this.recordUsecase = new RecordUsecase(context);
	}
}
