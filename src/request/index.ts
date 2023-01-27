import http from 'http'
import https from 'https'
import http2 from 'http2'

import { NexusRequestOptions } from '../interface'
import { InvalidArgumentException } from '../exception'

export class Request {
	public options?: NexusRequestOptions

	constructor(options?: NexusRequestOptions) {
		this.options = options || {}
	}

	async get(path?: string, getParams?: object): Promise<any> {
		return this.request('GET', path)
	}

	async post(path?: string, postData?: object): Promise<any> {
		return this.request('POST', path, postData)
	}

	async put(path?: string, putData?: object): Promise<any> {
		return this.request('PUT', path)
	}

	async delete(path?: string, deleteData?: object): Promise<any> {
		return this.request('DELETE', path)
	}

	async request(
		method: string,
		path?: string,
		postData?: object,
	): Promise<any> {
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
			const client = http2.connect(url.origin)
			const req = client.request({
				':method': method,
				':path': url.pathname,
			})
			req.setEncoding('utf8')
			req.on('response', (headers, flags) => {
				for (const name in headers) {
					console.log(`${name}: ${headers[name]}`)
				}
			})
			let data = ''
			req.on('data', (chunk) => {
				data += chunk
			})
			req.on('end', () => {
				client.close()
			})
			req.end()
		} else {
			let client: any

			if (url.protocol === 'https:') {
				client = https.request(url, {
					method: method,
				})
			} else if (url.protocol === 'http:') {
				client = http.request(url, {
					method: method,
				})
			}

			let data = ''

			client.on('data', (chunk) => {
				console.log(chunk)
				data += chunk
			})
			client.on('end', (data) => {
				console.log(data)
			})
			client.end()
		}
	}
}
