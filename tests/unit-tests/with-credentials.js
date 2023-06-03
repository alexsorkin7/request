const SimpleTest = require('als-simple-test');
let {describe,it,runTests,expect} = SimpleTest
SimpleTest.showFullError = true
const withCredentials = require('../../src/request/with-credentials');

// If a valid URL or '*' is passed as the origin, the Access-Control-Allow-Origin header is set correctly.
// If an invalid URL is passed as the origin, an error is added to the errors array.
// If a valid max age is passed, the Access-Control-Max-Age header is set correctly.
// If an invalid max age is passed, an error is added to the errors array.
// If valid methods are passed, the Access-Control-Allow-Methods header is set correctly.
// If invalid methods are passed, an error is added to the errors array.

describe('withCredentials tests',() => {

   it('Should set Access-Control-Allow-Origin header if valid origin is passed',() => {
      const options = {headers: {}};
      const errors = [];
      withCredentials('http://example.com', 2592000, 'GET', 'http://example.com', options, errors);
      expect(options.headers['Access-Control-Allow-Origin']).is('Access-Control-Allow-Origin').equalTo('http://example.com');
      expect(errors).is('errors').sameAs([]);
   })

   it('Should add error if invalid origin is passed',() => {
      const options = {headers: {}};
      const errors = [];
      withCredentials('invalid-url', 2592000, 'GET', 'http://example.com', options, errors);
      expect(errors[0].errorCode).is('error code').equalTo('ORIGINWRONG');
   })

   it('Should set Access-Control-Max-Age header if valid max age is passed',() => {
      const options = {headers: {}};
      const errors = [];
      withCredentials('http://example.com', 2592000, 'GET', 'http://example.com', options, errors);
      expect(options.headers['Access-Control-Max-Age']).is('Access-Control-Max-Age').equalTo(2592000);
      expect(errors).is('errors').sameAs([]);
   })

   it('Should add error if invalid max age is passed',() => {
      const options = {headers: {}};
      const errors = [];
      withCredentials('http://example.com', 'invalid-max-age', 'GET', 'http://example.com', options, errors);
      expect(errors[0].errorCode).is('error code').equalTo('IVALIDMAXAGE');
   })

   it('Should set Access-Control-Allow-Methods header if valid methods are passed',() => {
      const options = {headers: {}};
      const errors = [];
      withCredentials('http://example.com', 2592000, 'GET, POST', 'http://example.com', options, errors);
      expect(options.headers['Access-Control-Allow-Methods']).is('Access-Control-Allow-Methods').equalTo('GET, POST');
      expect(errors).is('errors').sameAs([]);
   })

   it('Should add error if invalid methods are passed',() => {
      const options = {headers: {}};
      const errors = [];
      withCredentials('http://example.com', 2592000, 'GET, INVALID', 'http://example.com', options, errors);
      expect(errors[0].errorCode).is('error code').equalTo('INVALIDMETHOD');
   })
});

runTests();
