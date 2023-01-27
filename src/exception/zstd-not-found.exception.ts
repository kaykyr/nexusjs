export class ZSTDNotFoundExeption extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ZSTDNotFoundExeption'
	}
}
