export function toCamelCase(value: any): object {
	if (value instanceof Array) {
		return value.map((v) => toCamelCase(v))
	} else if (typeof value === 'object' && value !== null) {
		const n: { [key: string]: object | string | number } = {}
		Object.keys(value).forEach((k) => {
			if (typeof value[k] === 'object') {
				n[
					k
						.toLowerCase()
						.replace(/([-_][a-z])/g, (g) =>
							g.toUpperCase().replace('-', '').replace('_', ''),
						)
				] = toCamelCase(value[k])
			} else {
				n[
					k
						.toLowerCase()
						.replace(/([-_][a-z])/g, (g) =>
							g.toUpperCase().replace('-', '').replace('_', ''),
						)
				] = value[k]
			}
		})

		return n
	}

	return value
}

export function toSnakeCase(value: any): object {
	if (value instanceof Array) {
		return value.map((v) => toSnakeCase(v))
	} else if (typeof value === 'object' && value !== null) {
		const n: { [key: string]: object | string | number } = {}

		Object.keys(value).forEach((k) => {
			if (typeof value[k] === 'object') {
				n[k.replace(/[A-Z]/g, (g) => `_${g.toLowerCase()}`)] =
					toSnakeCase(value[k])
			} else {
				n[k.replace(/[A-Z]/g, (g) => `_${g.toLowerCase()}`)] = value[k]
			}
		})

		return n
	}

	return value
}

export function keysToLower(obj: { [key: string]: any } | undefined) {
    if (!obj) return {}
    const keys = Object.keys(obj)
    const n: { [key: string]: any } = {}
    let key: string
    let val: any
    for (let i = 0; i < keys.length; i++) {
        key = keys[i]
        val = obj[key]
        n[key.toLowerCase()] = val
    }
    return n
}