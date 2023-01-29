import querystring, { ParsedUrlQueryInput } from 'node:querystring'
import http, { IncomingMessage } from 'node:http'
import { Socket } from 'node:net'
import https from 'node:https'
import http2 from 'node:http2'
import os from 'node:os'

import { Proxy } from './proxy'

import { keysToLower } from '../helpers'

import { NexusRequestOptions, NexusFullResponse, NexusData } from '../interface'
import { InvalidArgumentException, ProxyException, TimeoutException } from '../exception'

export class Request {
	protected version: string = '1.1.2'
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
			let url = this.options?.baseURL || this.options?.url || path

			if (typeof url !== 'string')
				throw new InvalidArgumentException('URL must be a string')
			if (!url) throw new InvalidArgumentException('No URL provided')
			let baseURL = new URL(url)

			requestURL = `${baseURL.host}${baseURL.port && `:${baseURL.port}`}${
				baseURL.pathname ? baseURL.pathname : ''
			}`

			if (this.options?.baseURL || this.options?.url) {
				requestURL += path
					? `/${path}${
							data?.params && Object.keys(data.params).length > 0
								? `?${querystring.stringify(
										<ParsedUrlQueryInput>data.params,
								  )}`
								: ''
					  }`
					: ''
			}

			requestURL =
				`${baseURL.protocol ? baseURL.protocol : 'https:'}//` +
				requestURL?.replace(/\/\//g, '/')
		} catch (error) {
            console.log(error)
			throw new InvalidArgumentException('Invalid URL provided')
		}

		this.options.fullURL = requestURL
		const url = new URL(requestURL)

		let postData: string | null = null

		if (data?.data && Object.keys(data.data).length > 0) {
			if (this.options?.setURLEncoded || data?.setURLEncoded) {
				postData = querystring.stringify(<ParsedUrlQueryInput>data.data)
			} else {
				postData = JSON.stringify(data.data)
			}
		}

		let headers = {
			...keysToLower(this.options?.headers),
			...keysToLower(data?.headers),
		}

		for (const key in headers) {
			if (headers[key] === undefined) {
				delete headers[key]
			}
		}

		let socket: Socket | undefined = undefined

		if (this.options?.proxy) {
			if (typeof this.options.proxy !== 'string') {
				throw new InvalidArgumentException('Proxy must be a string')
			}

            try {
                const proxy = new Proxy(new URL(this.options.proxy), url)

                socket = await proxy.connect()
            } catch (error: any) {
                throw new ProxyException(error.message)
            }
		}

		return new Promise((resolve, reject) => {
            const requestTimeout = setTimeout(() => {
                reject(new TimeoutException('Request timed out'))
            }, this.options.timeout || 10000)

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
				client = http2.connect(
					url.origin,
					socket
						? {
								host: url.hostname,
								socket,
								ALPNProtocols: socket ? ['h2'] : undefined,
						  }
						: undefined,
				)

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
					socket,
					headers: {
						...requestOptions,
					},
				}
			}

			const request = client.request(requestOptions).end(postData)

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
                            clearTimeout(requestTimeout)
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
				const buffer: Buffer[] = []

				request
					.on('data', (chunk: Buffer) => {
						buffer.push(chunk)
						response.data += Buffer.from(chunk)
					})
					.on('end', () => {
						client.close()
						response.statusCode = response.headers[':status']
                        clearTimeout(requestTimeout)

						resolve({ ...response, data: Buffer.concat(buffer) })
					})
					.on('error', (error: any) => {
						reject(error)
					})
			}
		})
	}
}
