const SimpleTest = require('als-simple-test');
let {describe,it,runTests,expect} = SimpleTest
const check = require('../../src/request/prepare-request');
SimpleTest.showFullError = true

describe('isValidUrl tests',() => {
   it('Test valid URL', () => {
      let errors = []
      let referer = null
      let result = check('http://www.example.com', referer, errors);
      expect(result.requester).defined()
      expect(result.url).equalTo('http://www.example.com');
      expect(result.options.headers).sameAs({});
   })
   // 

   it('Test invalid URL',() => {
      let errors = []
      let referer = null
      result = check('invalid url', referer, errors);
      expect(result.requester).equalTo(null);
      expect(result.url).equalTo('invalid url');
      expect(result.options.headers).sameAs({});

   })

   it('Test https protocol',() => {
      let errors = []
      let referer = null
      let result = check('https://www.example.com', referer,errors);
      expect(result.requester).defined();
      expect(result.url).equalTo('https://www.example.com');
      expect(result.options.headers).sameAs({});

   })

   it('Test http protocol',() => {
      let errors = []
      let referer = null
      let result = check('http://www.example.com', referer,errors);
      expect(result.requester).defined();
      expect(result.url).equalTo('http://www.example.com');
      expect(result.options.headers).sameAs({});
   })

   it('Test unsupported protocol',() => {
      let errors = []
      let referer = null
      let result = check('ftp://www.example.com', referer, errors);
      expect(result.requester).equalTo(null);
      expect(result.url).equalTo('ftp://www.example.com');
      expect(result.options.headers).sameAs({});
      expect(errors[0]).defined()
      expect(errors[0].errorCode).equalTo('INVALIDPROTOCOL');
   })
})

runTests()
