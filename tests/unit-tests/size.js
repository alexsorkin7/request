const SimpleTest = require('als-simple-test');
let {describe,it,runTests,expect} = SimpleTest
SimpleTest.showFullError = true
const getLength = require('../../src/response/size');

const {TextEncoder} = require('util');


describe('getLength tests',() => {
   it('Should return content-length if present',() => {
      const response = {headers: {'content-length': '5'}, data: 'test'};
      const result = getLength(response);
      expect(result).is('content length').equalTo('5');
   })

   it('Should return length of encoded text if content-length is not present',() => {
      const response = {headers: {}, data: 'test'};
      const result = getLength(response);
      const utf8Encoder = new TextEncoder();
      const encodedText = utf8Encoder.encode('test');
      expect(result).is('encoded text length').equalTo(encodedText.length);
   })

   it('Should return length of encoded text if headers are not present',() => {
      const response = {data: 'test'};
      const result = getLength(response);
      const utf8Encoder = new TextEncoder();
      const encodedText = utf8Encoder.encode('test');
      expect(result).is('encoded text length').equalTo(encodedText.length);
   })

   it('Should return 0 if data is not present',() => {
      const response = {headers: {}};
      const result = getLength(response);
      expect(result).is('encoded text length').equalTo(0);
   })

   it('Should return content-length header value if present',() => {
      const response = {headers: {'content-length': '100'}, data: 'test'};
      const result = getLength(response);
      expect(result).is('content length').equalTo('100');
   });

   it('Should return length of encoded text if content-length header is not present',() => {
      const response = {headers: {}, data: 'test'};
      const result = getLength(response);
      expect(result).is('encoded text length').equalTo(4);
   });

   it('Should return length of encoded text if content-length header is empty',() => {
      const response = {headers: {'content-length': ''}, data: 'test'};
      const result = getLength(response);
      expect(result).is('encoded text length').equalTo(4);
   });

   it('Should handle multi-byte characters correctly',() => {
      const response = {headers: {}, data: '测试'};
      const result = getLength(response);
      expect(result).is('encoded text length').equalTo(6);
   });
});

runTests();
