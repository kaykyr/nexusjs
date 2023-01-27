import { NexusRequestOptions } from './'

export interface NexusResponse {
	statusCode: number
	headers: object
	data: any
}

export interface NexusFullResponse {
	request: NexusRequestOptions
	statusCode: number
	headers: object
	data: any
}
