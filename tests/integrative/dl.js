const SimpleTest = require('als-simple-test');
let { describe, it, beforeEach, runTests, expect, delay, beforeAll, afterAll } = SimpleTest
let server = require('./server/server')

const Request = require('../../src/main');
const maxBytes = 250
Request.limitSpeed(maxBytes) // Set a speed limit in bytes per second
SimpleTest.showFullError = true
let url = 'http://localhost:3000/'

describe('Download Manager tests', () => {
   beforeAll(() => server())
   afterAll(() => process.exit())

   it('Should pause and resume downloads based on speed limit', async () => {
      // let now = Date.now()
      let promises = []
      let paused = []
      let resumed = []
      const maxRequests = 10
      const sizeMb = 0.5
      for(let i=0; i<maxRequests; i++) {
         const curUrl =  url+`file/${sizeMb}?num=${i}`
         let req = new Request(curUrl)
         req.onPause = (request,response) => {
            paused.push(curUrl)
            console.log(curUrl,' paused')
         }
         req.onResume = (request,response) => {
            resumed.push(curUrl)
            console.log(curUrl,' resumed')
         }
         let promise = req.request().response()
         promises.push(promise)
      }
      let results = await Promise.all(promises)
      // console.log((Date.now() - now)/1000,'s')
      expect(paused.length).is('All paused has to be resumed').equalTo(resumed.length)
      // TODO Are all paused are the same with all resumed?
      expect(results.length).equalTo(10)
      expect((maxRequests*sizeMb*1024)/maxBytes/2).closeTo(10,0)
   });
});

runTests()