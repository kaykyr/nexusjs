import { Request } from './request'

import { NexusRequestOptions } from './interface'

class Nexus {
	public options?: NexusRequestOptions
    public paramsData?: object
    public postData?: object
	private request: Request

	constructor(options?: NexusRequestOptions) {
		this.options = options || {}
		this.request = new Request(this.options)

		if (this?.options?.method) {
			this.request[this.options.method](
				this.options.url,
				this.options?.data,
			)
		}

		return this
	}

	async get(path?: string, getParams?: object): Promise<any> {
		return this.request.get(path, getParams)
	}

	async post(path?: string, postData?: object): Promise<any> {
		return this.request.post(path, postData)
	}

	async put(path?: string, putData?: object): Promise<any> {
		return this.request.put(path, putData)
	}

	async delete(path?: string, deleteData?: object): Promise<any> {
		return this.request.delete(path, deleteData)
	}

    addParam(key: string, value: string): Nexus {
        this.paramsData = {
            ...this.paramsData,
            [key]: value
        }

        return this
    }

    addPost(key: string, value: string): Nexus {
        this.postData = {
            ...this.postData,
            [key]: value
        }

        return this
    }
}

export default function nexus(options?: NexusRequestOptions): Nexus {
	return new Nexus(options)
}

export * from './interface'
