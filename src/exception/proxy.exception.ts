export class ProxyException extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ProxyException'
	}
}
