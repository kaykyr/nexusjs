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
		return this._request('GET', path, data)
	}

	public async post(path?: string, data?: object): Promise<any> {
		return this._request('POST', path, data)
	}

	public async put(path?: string, data?: object): Promise<any> {
		return this._request('PUT', path, data)
	}

	public async delete(path?: string, data?: object): Promise<any> {
		return this._request('DELETE', path, data)
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
		try {
			const response = await this.request.make(method, path, data)
            return await this.response.build(response)
		} catch (error) {
			throw new ResponseException(error)
		}
	}
}

export default function nexus(options?: NexusRequestOptions): Nexus {
	return new Nexus(options)
}

export * from './interface'
