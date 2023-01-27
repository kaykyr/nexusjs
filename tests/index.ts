import nexus from '../src/'

async function routine() {
    const api = nexus({
        http2: true,
        baseURL: 'https://httpbin.org',
        response: {
            transformJson: true,
            stringifyBigInt: true,
            forceCamelCase: true,
        }
    })
    
    const response = await api.get('/get')
    console.log(response)
}

routine()