const SimpleTest = require('als-simple-test');
let {describe,it,runTests,expect} = SimpleTest
SimpleTest.showFullError = true
const isValidUrl = require('../../src/request/is-valid-url');

describe('isValidUrl tests',() => {
   it('Should return false for empty url',() => {
      expect(isValidUrl('')).is('valid url').equalTo(false)
   })

   it('Should return false for invalid scheme',() => {
      expect(isValidUrl('tel:1234567890')).is('valid url').equalTo(false)
   })

   it('Should return false for invalid url',() => {
      expect(isValidUrl('example.com')).is('valid url').equalTo(false)
   })

   it('Should return the original url for valid http url',() => {
      const url = 'http://example.com';
      expect(isValidUrl(url).url).is('valid url').equalTo(url)
   })

   it('Should return the original url for valid https url',() => {
      const url = 'https://example.com';
      expect(isValidUrl(url).url).is('valid url').equalTo(url)
   })

   it('Should handle url relative to the referer origin',() => {
      const url = '/path';
      const referer = 'http://example.com';
      expect(isValidUrl(url, referer).url).is('valid url').equalTo(referer + url)
   })

   it('Should handle url relative to the referer pathname',() => {
      const url = 'relative-path';
      const referer = 'http://example.com/path';
      expect(isValidUrl(url, referer).url).is('valid url').equalTo(referer + '/' + url)
   })

   it('Should handle url relative to the referer pathname with trailing slash',() => {
      const url = 'relative-path';
      const referer = 'http://example.com/path/';
      expect(isValidUrl(url, referer).url).is('valid url').equalTo(referer + url)
   })

   it('Should handle url relative to the referer when pathname is "/"',() => {
      const url = 'relative-path';
      const referer = 'http://example.com/';
      expect(isValidUrl(url, referer).url).is('valid url').equalTo(referer + url)
   })
   
   it('Should handle url relative to the referer when pathname is "/" and url starts with "/"',() => {
      const url = '/relative-path';
      const referer = 'http://example.com/';
      expect(isValidUrl(url, referer).url).is('valid url').equalTo(referer + url.slice(1))
   })
});

runTests();
