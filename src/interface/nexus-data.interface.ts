import { NexusHeaders } from './'

export interface NexusData {
    setURLEncoded?: boolean
	headers?: NexusHeaders
	data: object
}
