import { NexusHeaders } from './'

export interface NexusResponse {
    statusCode: number
	headers: NexusHeaders
	data: any
}
