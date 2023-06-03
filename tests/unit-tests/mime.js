const SimpleTest = require('als-simple-test');
let {describe,it,runTests,expect} = SimpleTest
SimpleTest.showFullError = true
const contentType = require('../../src/response/mime');
const mime = require('mime-types');

describe('contentType tests',() => {

   it('Should return null for empty headers and url',() => {
      expect(contentType({})).is('content type').equalTo(null)
   })

   it('Should return mime type for headers with content-type',() => {
      const headers = {'content-type': 'text/html'};
      expect(contentType(headers)).is('content type').equalTo(mime.contentType(headers['content-type']))
   })

   it('Should return null for headers without content-type',() => {
      const headers = {'other-header': 'value'};
      expect(contentType(headers)).is('content type').equalTo(null)
   })

   it('Should return mime type for url with filename',() => {
      const url = 'http://example.com/file.html';
      const filename = 'file.html';
      expect(contentType({}, url)).is('content type').equalTo(mime.contentType(filename))
   })

   it('Should return null for url without filename',() => {
      const url = 'http://example.com/';
      expect(contentType({}, url)).is('content type').equalTo(null)
   })

   it('Should return mime type for headers with content-type even if url has filename',() => {
      const headers = {'content-type': 'text/html'};
      const url = 'http://example.com/file.json';
      expect(contentType(headers, url)).is('content type').equalTo(mime.contentType(headers['content-type']))
   })
   
   it('Should return null for invalid content-type in headers',() => {
      const headers = {'content-type': 'invalid/type'};
      expect(contentType(headers)).is('content type').equalTo('invalid/type')
   })

   it('Should return null for invalid filename in url',() => {
      const url = 'http://example.com/invalid.filetype';
      expect(contentType({}, url)).is('content type').equalTo(null)
   })

});

runTests();
