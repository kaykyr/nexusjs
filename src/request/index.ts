import http, { IncomingMessage } from 'node:http'
import https from 'node:https'
import http2 from 'node:http2'

import { NexusRequestOptions, NexusResponse } from '../interface'
import { InvalidArgumentException } from '../exception'

export class Request {
	public options?: NexusRequestOptions

	constructor(options?: NexusRequestOptions) {
		this.options = options || {}
	}

	public async get(path?: string, getParams?: object): Promise<any> {
		return this.request('GET', path)
	}

	public async post(path?: string, postData?: object): Promise<any> {
		return this.request('POST', path, postData)
	}

	public async put(path?: string, putData?: object): Promise<any> {
		return this.request('PUT', path)
	}

	public async delete(path?: string, deleteData?: object): Promise<any> {
		return this.request('DELETE', path)
	}

	protected async request(
		method: string,
		path?: string,
		postData?: object,
	): Promise<NexusResponse> {
		let requestURL: string = ''

		try {
			let url = this.options?.baseURL || path

			if (typeof url !== 'string')
				throw new InvalidArgumentException('URL must be a string')
			if (!url) throw new InvalidArgumentException('No URL provided')
			let baseURL = new URL(url)

			requestURL = `${baseURL.protocol ? baseURL.protocol : 'https:'}//${
				baseURL.host
			}${baseURL.port && `:${baseURL.port}`}${
				baseURL.pathname ? `/${baseURL.pathname}` : ''
			}`

			if (path) requestURL += `/${path}`
		} catch (error) {
			throw new InvalidArgumentException('Invalid URL provided')
		}

		const url = new URL(requestURL)

		return new Promise((resolve, reject) => {
			let client: any
			let requestOptions: object = {}

			if (this.options?.http2) {
				client = http2.connect(url.origin)
				requestOptions = {
					':method': method,
					':path': url.pathname,
				}
			} else {
				if (url.protocol === 'https:') client = https
				else client = http

				requestOptions = {
					method,
					hostname: url.hostname,
					port: url.port !== '' ? url.port : undefined,
					path: url.pathname,
				}
			}

			const request = client.request(requestOptions)

			const response = {
				statusCode: 0,
				headers: {},
				data: '',
			}

			request.on(
				'response',
				(serverResponse: string[] | IncomingMessage) => {
					if (this.options?.http2) {
						serverResponse = <string[]>serverResponse

						for (const name in serverResponse) {
							response.headers[name] = serverResponse[name]
						}
					} else {
						serverResponse = <IncomingMessage>serverResponse

						response.statusCode = serverResponse.statusCode || 0
						response.headers = serverResponse.headers

						serverResponse.on('data', (chunk: string) => {
							response.data += chunk
						})

						serverResponse.on('end', () => {
							resolve(response)
						})

						serverResponse.on('error', (error: any) => {
							reject(error)
							client.close()
							request.end()
						})
					}
				},
			)

			if (this.options?.http2) {
				request.setEncoding(this.options?.encoding || 'utf8')

				request.on('data', (chunk: string) => {
					response.data += chunk
				})

				request.on('end', () => {
					client.close()
					response.statusCode = response.headers[':status']
					resolve(response)
				})

				request.on('error', (error: any) => {
					reject(error)
				})
			}

			request.end()
		})
	}
}
