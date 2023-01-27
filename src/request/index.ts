import os from 'node:os'
import http, { IncomingMessage } from 'node:http'
import https from 'node:https'
import http2 from 'node:http2'
import querystring, { ParsedUrlQueryInput } from 'node:querystring'

import { NexusRequestOptions, NexusFullResponse, NexusData } from '../interface'
import { InvalidArgumentException } from '../exception'

export class Request {
	protected version: string = '1.0.0'
	public options: NexusRequestOptions

	constructor(options?: NexusRequestOptions) {
		this.options = options || {}
	}

	public async make(
		method: string,
		path?: string,
		data?: NexusData,
	): Promise<NexusFullResponse> {
		let requestURL: string = ''

		try {
			let url = this.options?.baseURL || path

			if (typeof url !== 'string')
				throw new InvalidArgumentException('URL must be a string')
			if (!url) throw new InvalidArgumentException('No URL provided')
			let baseURL = new URL(url)

			requestURL = `${baseURL.host}${baseURL.port && `:${baseURL.port}`}${
				baseURL.pathname ? baseURL.pathname : ''
			}`

			requestURL += path
				? `/${path}${
						data?.params && Object.keys(data.params).length > 0
							? `?${querystring.stringify(
									<ParsedUrlQueryInput>data.params,
							  )}`
							: ''
				  }`
				: ''
			requestURL =
				`${baseURL.protocol ? baseURL.protocol : 'https:'}//` +
				requestURL?.replace(/\/\//g, '/')
		} catch (error) {
			throw new InvalidArgumentException('Invalid URL provided')
		}

		this.options.fullURL = requestURL
		const url = new URL(requestURL)

		let postData: string | null = null

		if (data?.data) {
			if (this.options?.setURLEncoded || data?.setURLEncoded) {
				postData = querystring.stringify(<ParsedUrlQueryInput>data.data)
			} else {
				postData = JSON.stringify(data.data)
			}
		}

		let headers = {
			...this.options?.headers,
			...data?.headers,
		}

		//Remove undefined headers
		for (const key in headers) {
			if (headers[key] === undefined) {
				delete headers[key]
			}
		}

		return new Promise((resolve, reject) => {
			let client: any
			let requestOptions: object = {
				'content-length': postData ? Buffer.byteLength(postData) : 0,
				'content-type':
					this.options?.setURLEncoded || data?.setURLEncoded
						? 'application/x-www-form-urlencoded'
						: 'application/json',
				'user-agent': `NexusJS/${
					this.version
				} (${os.type()} ${os.release()}; ${os.arch()})`,
				...headers,
			}

			if (this.options?.http2) {
				client = http2.connect(url.origin)
				requestOptions = {
					':method': method,
					':path': url.pathname + url.search,
					...requestOptions,
				}
			} else {
				if (url.protocol === 'https:') client = https
				else client = http

				requestOptions = {
					method,
					hostname: url.hostname,
					port: url.port !== '' ? url.port : undefined,
					path: url.pathname + url.search,
					headers: {
						...requestOptions,
					},
				}
			}

			const request = client.request(requestOptions)

			const response: NexusFullResponse = {
				request: this.options,
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

			request.end(postData)
		})
	}
}
