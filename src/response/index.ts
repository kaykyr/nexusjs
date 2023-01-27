import { Duplex } from 'stream'
import JSONbigInt from 'json-bigint'

import { ZSTD } from './zstd'

import { toCamelCase, toSnakeCase } from '../helpers'

import {
	NexusFullResponse,
	NexusResponse,
	NexusResponseOptions,
} from '../interface'
import { InvalidArgumentException, NexusException } from '../exception'

export class Response {
	private readonly zstd: ZSTD = new ZSTD()
	private readonly JSONbigInt = JSONbigInt({ storeAsString: true })

	private readonly compressedEncondings: string[] = [
		'zstd',
		'gzip'
	]

	private options?: NexusResponseOptions

	constructor(options?: NexusResponseOptions) {
		this.options = options || {
			decompress: true,
			transformJson: true,
			stringifyBigInt: true,
		}

		if (
			(this.options?.forceCamelCase || this.options?.forceSnakeCase) &&
			!this.options?.transformJson
		) {
			throw new InvalidArgumentException(
				'You must enable transformJson option to use forceCamelCase or forceSnakeCase options.',
			)
		}

		if (this.options?.forceCamelCase && this.options?.forceSnakeCase) {
			throw new InvalidArgumentException(
				"You can't use forceCamelCase and forceSnakeCase options together.",
			)
		}

		if (this.options?.stringifyBigInt && !this.options?.transformJson) {
			throw new InvalidArgumentException(
				'You must enable transformJson option to use stringifyBigInt option.',
			)
		}
	}

	async build(fullResponse: NexusFullResponse): Promise<NexusResponse> {
		let response: NexusResponse

		if (this.options?.responseTransformer) {
			response = await this.options.responseTransformer(fullResponse)
		} else {
			response = await this.transformer(fullResponse)
		}

		if (response.statusCode !== 200) {
			throw new NexusException(fullResponse)
		}

		return response
	}

	async transformer(response: NexusFullResponse): Promise<NexusResponse> {
		let data: string | object = response.data

		if (
			this.compressedEncondings.includes(
				response.headers['content-encoding'],
			)
		) {
			if (this.options?.decompress) {
				if (response.headers['content-encoding'] === 'zstd') {
					data = await this.zstdDecompress(response.data)
				} else {
					data = response.data.toString()
				}
			}
		}

		if (
			this.options?.transformJson &&
			response.headers['content-type'].includes('application/json')
		) {
			if (this.options?.stringifyBigInt) {
				data = this.JSONbigInt.parse(<string>data)
			} else {
				data = JSON.parse(<string>data)
			}

			if (this.options?.forceCamelCase) {
				data = toCamelCase(data)
			}

			if (this.options?.forceSnakeCase) {
				data = toSnakeCase(data)
			}
		} else {
			data = response.data
		}

		return {
			...response,
			data,
		}
	}

	async zstdDecompress(data: Buffer): Promise<string> {
		return new Promise((resolve, reject) => {
			const duplex = new Duplex()

			const decompressedBuffer: any[] = []

			duplex.push(data)
			duplex.push(null)
			duplex
				.pipe(this.zstd.decompress())
				.on('error', (error: any) => reject(error))
				.on('data', (data: any) => decompressedBuffer.push(data))
				.on('end', () =>
					resolve(Buffer.concat(decompressedBuffer).toString()),
				)
		})
	}
}
