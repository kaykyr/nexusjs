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
	requestTransformer?: Function | AsyncGeneratorFunction
}
