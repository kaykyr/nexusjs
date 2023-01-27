export interface NexusHeaders {
	[key: string]: string
}

export interface NexusRequestOptions {
	method?: string
	headers?: NexusHeaders
	baseURL?: string
	path?: string
	url?: string
	data?: object
}