import http from 'node:http'
import https from 'node:https'
import { Socket } from 'node:net'

import { ProxyException } from '../exception'
export class Proxy {
	private proxy: URL
	private authority: URL

	constructor(proxyUrl: URL, authority: URL) {
		if (proxyUrl.protocol !== 'http:' && proxyUrl.protocol !== 'https:') {
			throw new ProxyException(
				`Invalid proxy protocol ${proxyUrl.protocol}`,
			)
		}

		this.proxy = proxyUrl
		this.authority = authority
	}

	private getAuthorizationHeaders() {
		const { username, password } = this.proxy

		if (username || password) {
			const data = `${username}:${password}`
			const authorization = `Basic ${Buffer.from(data).toString(
				'base64',
			)}`

			return {
				'proxy-authorization': authorization,
				authorization,
			}
		}

		return {}
	}

	public async connect(): Promise<Socket> {
		return new Promise((resolve, reject) => {
			const network = this.proxy.protocol === 'https:' ? https : http
			const connectPath = `${this.authority.hostname}${
				this.authority.protocol === 'https:' ? ':443' : ':80'
			}`

			const tunnel = network
				.request({
					method: 'CONNECT',
					rejectUnauthorized: false,
					hostname: this.proxy.hostname,
					port: this.proxy.port,
					path: connectPath,
					headers: {
						...this.getAuthorizationHeaders(),
						host: connectPath,
					},
				})
				.end()

			tunnel.once('connect', (res, socket) => {
				if (res.statusCode !== 200) {
					reject(
						new ProxyException(
							`Proxy server returned ${res.statusCode}`,
						),
					)
				}

				resolve(socket)
			})

			tunnel.once('error', (error) => {
				reject(error)
			})
		})
	}
}
