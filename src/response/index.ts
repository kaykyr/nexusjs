import { Duplex } from 'stream'
import JSONbigInt from 'json-bigint'

import { ZSTD } from './zstd'

import { toCamelCase, toSnakeCase } from '../helpers'

import { NexusResponse, NexusResponseOptions } from '../interface'
import { InvalidArgumentException } from '../exception'

export class Response {
	protected zstd: ZSTD = new ZSTD()
	protected JSONbigInt = JSONbigInt({ storeAsString: true })

	protected compressedEncondings: string[] = ['zstd', 'gzip', 'deflate']

	public options?: NexusResponseOptions

	constructor(options?: NexusResponseOptions) {
		this.options = options || {
			decompress: true,
			transformJson: true,
			stringifyBigInt: true,
			responseTransformer: this.transformer,
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
	}

	async build(response: any): Promise<NexusResponse> {
		return {
			headers: response.headers,
			data: response.data,
		}
	}

	async transformer(
		response: NexusResponse,
	): Promise<string | object | Buffer> {
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

		if (this.options?.transformJson) {
			if (this.options?.stringifyBigInt) {
				data = this.JSONbigInt.parse(<string>data)
			} else {
				data = JSON.parse(<string>data)
			}
		}

		if (this.options?.forceCamelCase) {
			data = toCamelCase(data)
		}

		if (this.options?.forceSnakeCase) {
			data = toSnakeCase(data)
		}

		return data
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
