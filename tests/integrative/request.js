const SimpleTest = require('als-simple-test');
let {describe,it,beforeEach,runTests,expect,delay,beforeAll,afterAll} = SimpleTest
let server = require('./server/server')
const {join} = require('path')
const Request = require('../../src/main');
const FormData = require('form-data');
const fs = require('fs');
SimpleTest.showFullError = true

describe('Basic tests', () => {
    beforeAll(() => server())
    afterAll(() => process.exit())
    const url = 'http://localhost:3000/'
    it('GET with query string',async () => {
        const getRequest = new Request(`${url}?key=value`);
        const response = await getRequest.request({ method: 'GET' }).response()
        expect(response.json).sameAs({"message":"This is a GET route","data":{"key":"value"}})
    })

    it('GET with data',async () => {
        const getRequest = new Request(url);
        const response = await getRequest.request({ method: 'GET',data:{key:'value'} }).response()
        expect(response.json).sameAs({"message":"This is a GET route","data":{"key":"value"}})
    })

    it('POST',async () => {
        const postRequest = new Request(url);
        const response = await postRequest.request({ method: 'POST',data:'This is some data' }).response()
        expect(response.data).equalTo('This is a POST route')
    })

    it('POST with json',async () => {
        const postRequest = new Request(url+'post-json');
        const response = await postRequest.request({ method: 'POST',data:{key:'value'} }).response()
        expect(response.json).sameAs({ message: 'This is a POST JSON route', data: { key: 'value' } })
    })

    it('GET strem image',async () => {
        const getImageRequest = new Request(`${url}image`);
        const response = await getImageRequest.request({ method: 'GET' })
        .stream(join(__dirname,'imgs','downloaded_image.jpg'))
        expect(response.status).equalTo(200)
    })

    it('POST form-data',async () => {
        let form = new FormData()
        form.append('key', 'value');
        form.append('my_buffer', new Buffer.alloc(10));
        form.append('my_file', fs.createReadStream(join(__dirname,'imgs','image.jpg')));
        let request = new Request(url+'post-formdata').request({method:'post',data:form})
        let response = await request.response()
        expect(response.json).sameAs({
            message:'This is a POST form-data route',
            files: [
                {encoding: '7bit',mimeType: 'application/octet-stream',name: 'my_buffer',size: 10},
                {filename: 'image.jpg',encoding: '7bit',mimeType: 'image/jpeg',name: 'my_file',size: 2648},
            ],
            fields:[ { key: 'value' } ]
        })
    })
})

describe('Additional tests', () => {
    const url = 'http://localhost:3000/'

    it('PUT request', async () => {
        const putRequest = new Request(url);
        const response = await putRequest.request({ method: 'PUT', data:'This is some data' }).response()
        expect(response.data).equalTo('This is a PUT route')
    })

    it('DELETE request', async () => {
        const deleteRequest = new Request(url);
        const response = await deleteRequest.request({ method: 'DELETE' }).response()
        expect(response.data).equalTo('This is a DELETE route')
    })

    it('Error scenario - invalid route', async () => {
        const invalidRequest = new Request(url + 'nonExistentRoute');
        const result = await invalidRequest.request({ method: 'GET' }).response();
        expect(result.status).equalTo(404);
    })

    it('Testing timeout', async () => {
        const delayRequest = new Request(url + 'delayedResponse');
        try {
            await delayRequest.request({ method: 'GET', timeout: 2000 }).response();
            throw new Error('Expected request to fail due to timeout')
        } catch (error) {
            expect(error.message).includes('timeout');
        }
    })
})

describe('static methods', () => {
    beforeAll(() => server())
    afterAll(() => process.exit())
    const url = 'http://localhost:3000/'
    it('GET with query string',async () => {
        const response = await Request.get(`${url}?key=value`)
        expect(response.json).sameAs({"message":"This is a GET route","data":{"key":"value"}})
    })

    it('GET with data',async () => {
        const response = await Request.get(url,{data:{key:'value'}})
        expect(response.json).sameAs({"message":"This is a GET route","data":{"key":"value"}})
    })

    it('POST',async () => {
        const response = await Request.post(url,{data:'This is some data'})
        expect(response.data).equalTo('This is a POST route')
    })

    it('POST with json',async () => {
        const response = await Request.post(url+'post-json',{data:{key:'value'}})
        expect(response.json).sameAs({ message: 'This is a POST JSON route', data: { key: 'value' } })
    })

    it('GET stream image',async () => {
        const path = join(__dirname,'imgs','downloaded_image.jpg')
        if(fs.existsSync(path)) fs.unlinkSync(path)
        let responseHookWorks = false
        let size
        let type
        const onResponse = (req,resObj) => {
            responseHookWorks = true
            type = resObj.response.type
            size = resObj.response.size
        }
        const response = await Request.get(`${url}image`,{path,onResponse})
        expect(response.status).equalTo(200)
        expect(fs.existsSync(path)).equalTo(true)
        expect(size).equalTo('2648')
        expect(type).equalTo('image/jpeg')
        expect(responseHookWorks).equalTo(true)
        if(fs.existsSync(path)) fs.unlinkSync(path)
    })

    it('Not downloading',async () => {
        const onResponse = (req,resObj) => {
            resObj.download = false
        }
        const response = await Request.get(url,{data:{key:'value'},onResponse})
        expect(response.data).isNot().defined()
        expect(response.json).isNot().defined()
    })

    it('POST form-data',async () => {
        let form = new FormData()
        form.append('key', 'value');
        form.append('my_buffer', new Buffer.alloc(10));
        form.append('my_file', fs.createReadStream(join(__dirname,'imgs','image.jpg')));
        const response = await Request.post(url+'post-formdata',{data:form})
        expect(response.json).sameAs({
            message:'This is a POST form-data route',
            files: [
                {encoding: '7bit',mimeType: 'application/octet-stream',name: 'my_buffer',size: 10},
                {filename: 'image.jpg',encoding: '7bit',mimeType: 'image/jpeg',name: 'my_file',size: 2648},
            ],
            fields:[ { key: 'value' } ]
        })
    })
})


runTests()