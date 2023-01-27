export class ResponseException extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ResponseException'
	}
}
