export class ConnectionException extends Error {
	constructor(error: any) {
		super(error)
		this.name = 'NexusConnectionException'
	}
}
