export const throwInvalidParamerterError = (
	param: string,
	message?: string,
): never => {
	throw new BadRequestError(
		`Invalid parameter: ${param}${message ? ` (${message})` : ""}`,
	);
};

export const throwInternalServerError = (message: string): never => {
	throw new InternalServerError(`Internal Server Error${message}`);
};

export enum ErrorCode {
	BAD_REQUEST_ERROR = "BAD_REQUEST_ERROR",
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export class BadRequestError extends Error {
	constructor(message: string) {
		super(message);
		this.name = ErrorCode.BAD_REQUEST_ERROR;
	}
}

export class InternalServerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = ErrorCode.INTERNAL_SERVER_ERROR;
	}
}
