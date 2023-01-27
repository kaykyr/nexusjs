import nexus from '../src/'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function routine() {
	const api = nexus({
		http2: false,
		baseURL: 'https://httpbin.org/',
        proxy: 'http://127.0.0.1:8080',
		setURLEncoded: false,
		response: {
			transformJson: true,
			stringifyBigInt: true,
			forceCamelCase: true,
		},
	})

	const response = await api
		.addHeader('Foo', 'Bar')
		.addPost('post-data', 'data-post')
		.post('post', {
			data: {
				foo: 'bar',
			},
		})
	console.log(response.data)
}

routine()
