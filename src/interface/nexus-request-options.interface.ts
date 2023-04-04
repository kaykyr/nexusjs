import { NexusResponseOptions } from './'

export interface NexusRequestOptions {
	url?: string
	path?: string
	data?: object
	http2?: boolean
	proxy?: string
	method?: string
	params?: object
	headers?: object
	baseURL?: string
	timeout?: number
    fullURL?: string
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
	setURLEncoded?: boolean
}
