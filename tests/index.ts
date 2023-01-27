import nexus from '../src/'

async function routine() {
    const api = nexus({
        http2: true,
        baseURL: 'https://httpbin.org',
        headers: {
            'X-Test': 'test',
        },
        response: {
            transformJson: true,
            stringifyBigInt: true,
            forceCamelCase: true,
        }
    })
    
    const response = await api.post('/post', {
        headers: {
            'X-Test-2': 'test-2',
        },
        data: {
            foo: 'bar',
            baz: 'qux',
        }
    })
    console.log(response.data)
}

routine()