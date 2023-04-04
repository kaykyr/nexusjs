import nexus, { Nexus } from '../src/'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function routine() {
	const api = new Nexus({
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
	console.log('Response: ', response.data)

    const response2 = await nexus('https://httpbin.org/post', {
        method: 'post',
        http2: false,
        proxy: 'http://127.0.0.1:8080',
		setURLEncoded: false,
		response: {
			transformJson: true,
			stringifyBigInt: true,
			forceCamelCase: true,
		},
    })

    console.log('Response2: ', response2.data)
}

routine()
