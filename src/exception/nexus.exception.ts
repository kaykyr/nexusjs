import { NexusFullResponse, NexusRequestOptions } from '../interface'

export class NexusException extends Error {
	public name: string
	public data: any
	public headers: object
	public request: NexusRequestOptions
	public statusCode: number

	constructor(response: NexusFullResponse) {
		super(
			`Server returned an ${response.statusCode} status response on requested URL ${response.request.fullURL}`,
		)
		this.name = 'NexusException'

        if (response.headers['content-type'] === 'application/json') {
            this.data = JSON.parse(response.data)
        } else {
            this.data = response.data
        }

		this.headers = response.headers
		this.request = response.request
		this.statusCode = response.statusCode
	}
}
