export class NexusResponseException extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'NexusResponseException'
	}
}
