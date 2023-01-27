import nexus from '../src/'

async function routine() {
    const api = nexus({
        baseURL: 'https://httpbin.org',
    })
    
    const response = await api.get('/get')
    console.log(response)
}

routine()