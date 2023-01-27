import { NexusResponseOptions } from './'

export interface NexusHeaders {
	[key: string]: string
}

export interface NexusRequestOptions {
	url?: string
	path?: string
	data?: object
	http2?: boolean
	method?: string
	headers?: NexusHeaders
	baseURL?: string
	response?: NexusResponseOptions
	encoding?:
		| 'ascii'
		| 'utf8'
		| 'utf-8'
		| 'utf16le'
		| 'ucs2'
		| 'ucs-2'
		| 'base64'
		| 'base64url'
		| 'latin1'
		| 'binary'
		| 'hex'
}
