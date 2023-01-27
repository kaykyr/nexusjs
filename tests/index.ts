import nexus from '../src/'

async function routine() {
	const api = nexus({
		http2: true,
		baseURL: 'https://httpbin.org/',
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
