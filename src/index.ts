import { Request } from './request'
import { Response } from './response'

import { NexusRequestOptions, NexusResponse } from './interface'
import { ResponseException } from './exception'

class Nexus {
	public options?: NexusRequestOptions
	public paramsData?: object
	public postData?: object

	private request: Request
	private response: Response

	constructor(options?: NexusRequestOptions) {
		this.options = options || { http2: false }
		this.request = new Request(this.options)
		this.response = new Response(this.options.response)

		if (this?.options?.method) {
			this.request[this.options.method](
				this.options.url,
				this.options?.data,
			)
		}

		return this
	}

	public async get(path?: string, data?: object): Promise<any> {
		return this._request('get', path, data)
	}

	public async post(path?: string, data?: object): Promise<any> {
		return this._request('post', path, data)
	}

	public async put(path?: string, data?: object): Promise<any> {
		return this._request('put', path, data)
	}

	public async delete(path?: string, data?: object): Promise<any> {
		return this._request('delete', path, data)
	}

	public addParam(key: string, value: string): Nexus {
		this.paramsData = {
			...this.paramsData,
			[key]: value,
		}

		return this
	}

	public addPost(key: string, value: string): Nexus {
		this.postData = {
			...this.postData,
			[key]: value,
		}

		return this
	}

	protected async _request(
		method: string,
		path?: string,
		data?: object,
	): Promise<NexusResponse> {
		let response: string

		try {
			response = await this.request[method](path, data)
		} catch (error) {
			throw new ResponseException(error)
		}

		return await this.response.build(response)
	}
}

export default function nexus(options?: NexusRequestOptions): Nexus {
	return new Nexus(options)
}

export * from './interface'
