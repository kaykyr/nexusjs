export class ZSTDCompressionException extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ZSTDCompressionException'
    }
}
