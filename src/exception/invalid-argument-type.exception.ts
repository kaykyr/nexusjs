export class InvalidArgumentTypeException extends Error {
	constructor(public argument: string, public type: string) {
		super(`Invalid argument type for ${argument}. Expected ${type}`)
	}
}
