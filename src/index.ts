import { NexusData } from './interface/nexus-data.interface'
import { Request } from './request'
import { Response } from './response'

import { NexusRequestOptions, NexusResponse } from './interface'

export class Nexus {
	public options?: NexusRequestOptions
	public headersData?: object
	public paramsData?: object
	public postData?: object

	private request: Request
	private response: Response

	constructor(options?: NexusRequestOptions) {
		this.options = options || { http2: false }
		this.request = new Request(this.options)
		this.response = new Response(this.options.response)

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

	public addHeader(key: string, value: string): Nexus {
		this.headersData = {
			...this.headersData,
			[key]: value,
		}

		return this
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
		data?: NexusData,
	): Promise<NexusResponse> {
		const response = await this.request.make(method, path, {
			headers: {
				...this.headersData,
				...data?.headers,
			},
			params: {
				...this.paramsData,
				...data?.params,
			},
			data: {
				...this.postData,
				...data?.data,
			},
		})
		return await this.response.build(response)
	}
}

export default function nexus(options?: NexusRequestOptions): Nexus {
	const nexusInstance = new Nexus(options)
	if (options?.method) {
		return nexusInstance[options.method.toLowerCase()](
			options.path || options.url,
			options.data,
		)
	}

	return nexusInstance
}

export * from './interface'
export * from './exception'
