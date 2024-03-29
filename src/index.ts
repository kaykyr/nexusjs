import { NexusData } from './interface/nexus-data.interface'
import { Request } from './request'
import { Response } from './response'

import { ConnectionException } from './exception'

import { NexusRequestOptions, NexusResponse } from './interface'

export class Nexus {
	public options: NexusRequestOptions
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
		try {
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
		} catch (error) {
			throw error
		}
	}

	public rawRequest(
		url: string,
		options: NexusRequestOptions,
	): Promise<NexusResponse> {
		const _options = options
		delete _options.url
		delete _options.path
		delete _options.baseURL

        try {
            return this._request(<string>_options.method!.toUpperCase(), url, {
                data: _options.data,
            })
        } catch (error) {
            throw new ConnectionException(error)
        }
	}
}

export default async function nexus(
	url: string,
	options: NexusRequestOptions,
): Promise<NexusResponse> {
	const nexus = new Nexus(options)
	return nexus.rawRequest(url, options)
}

export * from './interface'
export * from './exception'
