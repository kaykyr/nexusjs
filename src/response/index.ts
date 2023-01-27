import { NexusRequestOptions, NexusResponse } from '../interface'
import { InvalidArgumentException } from '../exception'

export class Request {
	public options?: NexusRequestOptions

	constructor(options?: NexusRequestOptions) {
		this.options = options || {}
	}

    async buildResponse(response: any): Promise<NexusResponse> {
        return {
            headers: response.headers,
            data: response.data
        }
    }
}
