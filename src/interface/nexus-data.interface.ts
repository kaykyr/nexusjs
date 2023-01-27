import { NexusHeaders } from './'

export interface NexusData {
    setURLEncoded?: boolean
	headers?: NexusHeaders
    params?: object
	data?: object
}
