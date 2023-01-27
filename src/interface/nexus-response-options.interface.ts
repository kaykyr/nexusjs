export interface NexusResponseOptions {
	decompress?: boolean
	transformJson?: boolean
	forceCamelCase?: boolean
	forceSnakeCase?: boolean
	stringifyBigInt?: boolean
	responseTransformer?: Function | AsyncGeneratorFunction
}
