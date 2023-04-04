import {
	NexusFullResponse,
	NexusRequestOptions,
	NexusResponseOptions,
} from '../interface'

import { toCamelCase, toSnakeCase } from '../helpers'

const statusDict = {
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    103: 'Early Hints',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi-Status',
    208: 'Already Reported',
    226: 'IM Used',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    306: 'Switch Proxy',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a teapot",
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    510: 'Not Extended',
    511: 'Network Authentication Required',
}
export class NexusException extends Error {
	public name: string
	public data: any
	public headers: object
	public request: NexusRequestOptions
	public statusCode: number
	public statusText: string

	constructor(response: NexusFullResponse, options: NexusResponseOptions) {
		super(
			`Server returned an ${response.statusCode} status response on requested URL ${response.request.fullURL}`,
		)
		this.name = 'NexusException'

		// I intent to use default response transformer in the future, but its ok for now...
		if (response.headers['content-type'].includes('application/json')) {
			if (options.transformJson) {
				if (options.stringifyBigInt) {
					this.data = JSON.parse(response.data, (key, value) => {
						if (typeof value === 'bigint') {
							return value.toString()
						}
						return value
					})
				} else {
					this.data = JSON.parse(response.data)
				}

				if (options.forceCamelCase) {
					this.data = toCamelCase(this.data)
				}

				if (options.forceSnakeCase) {
					this.data = toSnakeCase(this.data)
				}
			}
		} else {
			// If the response is not JSON, we just return the raw data (we can implements content-encoding check [zstd, gzip, etc] to decode the data)
			this.data = response.data
		}

		this.headers = response.headers
		this.request = response.request
		this.statusCode = response.statusCode
		this.statusText = statusDict[response.statusCode]
	}
}
