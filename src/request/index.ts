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

		if (this.options?.baseURL) {
			try {
				let baseURL = new URL(this.options?.baseURL)
				requestURL = `${
					baseURL.protocol ? baseURL.protocol : 'https:'
				}//${baseURL.host}${baseURL.port && `:${baseURL.port}`}${
					baseURL.pathname ? `/${baseURL.pathname}` : ''
				}${path ? `/${path}` : ''}`
			} catch (e) {
				throw new InvalidArgumentException('Invalid URL provided')
			}
		} else if (path) {
			try {
				let baseURL = new URL(path)
				requestURL = `${
					baseURL.protocol ? baseURL.protocol : 'https:'
				}//${baseURL.host}${baseURL.port && `:${baseURL.port}`}${
					baseURL.pathname ? `/${baseURL.pathname}` : ''
				}`
			} catch (e) {
				throw new InvalidArgumentException('Invalid URL provided')
			}
		} else {
			throw new InvalidArgumentException('No URL provided')
		}

		const url = new URL(requestURL)

		if (this.options?.http2) {
			return new Promise((resolve, reject) => {
				const client = http2.connect(url.origin)

				const req = client.request({
					':method': method,
					':path': url.pathname,
				})

				req.setEncoding(this.options?.encoding || 'utf8')

				let responseHeaders = {}

				req.on('response', (headers: string[]) => {
					for (const name in headers) {
						responseHeaders[name] = headers[name]
					}
				})

				let responseData: string = ''

				req.on('data', (chunk: string) => {
					responseData += chunk
				})

				req.on('end', () => {
					client.close()

					resolve({
						statusCode: responseHeaders[':status'],
						headers: responseHeaders,
						data: responseData,
					})
				})

				req.on('error', (error: any) => {
					reject(error)
				})

				req.end()
			})
		}

		return new Promise((resolve, reject) => {
			let client: any

			if (url.protocol === 'https:') client = https
			else client = http

			const request = client.request({
				method,
				hostname: url.hostname,
				port: 443,
				path: url.pathname,
			})

			const response = {
				statusCode: 0,
				headers: {},
				data: '',
			}

			request.on('response', (serverResponse: IncomingMessage) => {
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
					request.end()
				})
			})

			request.end()
		})
	}
}
