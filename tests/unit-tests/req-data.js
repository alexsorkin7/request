const SimpleTest = require('als-simple-test');
let {describe,it,runTests,expect} = SimpleTest
SimpleTest.showFullError = true
const processData = require('../../src/request/req-data');
const FormData = require('form-data');
const Stream = require('stream');

describe('Basic tests',() => {
   it('Should return options unchanged if data is undefined',() => {
      const options = {href: 'http://example.com', method: 'GET'};
      const errors = [];
      expect(processData(options, errors)).is('options').sameAs(options);
      expect(errors).is('errors').sameAs([]);
   })

   it('Should process object data for GET request',() => {
      const options = {href: 'http://example.com', method: 'GET', data: {key: 'value'}};
      const errors = [];
      const result = processData(options, errors);
      expect(result.search).is('search string').equalTo('?key=value');
      expect(result.data).isNot('data').defined();
      expect(errors).is('errors').sameAs([]);
   })

   it('Should add error if object data for GET request is too long',() => {
      const options = {href: 'http://example.com', method: 'GET', data: {key: 'a'.repeat(2001)}};
      const errors = [];
      processData(options, errors);
      expect(errors[0].errorCode).is('error code').equalTo('REQMAXDATA');
   })

   it('Should process FormData',() => {
      const formData = new FormData();
      formData.append('key', 'value');
      const options = {href: 'http://example.com', method: 'POST', data: formData};
      const errors = [];
      const result = processData(options, errors);
      expect(result.formData instanceof FormData).is('formData').sameAs(true);
      expect(result.data).isNot('data').defined();
      expect(errors).is('errors').sameAs([]);
   })

   it('Should process JSON data',() => {
      const options = {href: 'http://example.com', method: 'POST', data: {key: 'value'}, headers: {}};
      const errors = [];
      const result = processData(options, errors);
      expect(result.headers['Content-Type']).is('Content-Type').equalTo('application/json');
      expect(result.data).is('data').equalTo(JSON.stringify({key: 'value'}));
      expect(errors).is('errors').sameAs([]);
   })

   it('Should add error if JSON data cannot be stringified',() => {
      const circularObj = {};
      circularObj.prop = circularObj;
      const options = {href: 'http://example.com', method: 'POST', data: circularObj, headers: {}};
      const errors = [];
      processData(options, errors);
      expect(errors[0].errorCode).is('error code').equalTo('REQJSON');
   })

   it('Should process string data',() => {
      const options = {href: 'http://example.com', method: 'POST', data: 'string data', headers: {}};
      const errors = [];
      const result = processData(options, errors);
      expect(result.headers['Content-Type']).is('Content-Type').equalTo('text/plain');
      expect(result.data).is('data').equalTo('string data');
      expect(errors).is('errors').sameAs([]);
   })

   it('Should process Buffer data',() => {
      const options = {href: 'http://example.com', method: 'POST', data: Buffer.from('buffer data'), headers: {}};
      const errors = [];
      const result = processData(options, errors);
      expect(result.data).is('data').sameAs(Buffer.from('buffer data'));
      expect(errors).is('errors').sameAs([]);
   })

   it('Should process Stream data',() => {
      const data = new Stream.Readable();
      const options = {href: 'http://example.com', method: 'POST', data: data, headers: {}};
      const errors = [];
      const result = processData(options, errors);
      expect(result.data).is('data').sameAs(data);
      expect(errors).is('errors').sameAs([]);
   })

   it('Should add error if Stream data throws error',() => {
      const data = new Stream.Readable();
      const options = {href: 'http://example.com', method: 'POST', data: data, headers: {}};
      const errors = [];
      processData(options, errors);
      data.emit('error', new Error('Test error'));
      expect(errors[0].errorCode).is('error code').equalTo('REQSTREAM');
   })

   it('Should delete data if not object, FormData, JSON, string, Buffer, or Stream',() => {
      const options = {href: 'http://example.com', method: 'POST', data: 123, headers: {}};
      const errors = [];
      const result = processData(options, errors);
      expect(result.data).isNot('data').defined();
      expect(errors).is('errors').sameAs([]);
   })
});

describe('Advanced tests', () => {
   // Testing how the function handles a more complex FormData object
   it('Should process complex FormData',() => {
      const formData = new FormData();
      formData.append('key1', 'value1');
      formData.append('key2', 'value2');
      const options = {href: 'http://example.com', method: 'POST', data: formData};
      const errors = [];
      const result = processData(options, errors);
      expect(result.formData instanceof FormData).is('formData').sameAs(true);
      expect(result.data).isNot('data').defined();
      expect(errors).is('errors').sameAs([]);
   })

   // Testing how the function handles more complex JSON data
   it('Should process complex JSON data',() => {
      const options = {href: 'http://example.com', method: 'POST', data: {key1: 'value1', key2: 'value2'}, headers: {}};
      const errors = [];
      const result = processData(options, errors);
      expect(result.headers['Content-Type']).is('Content-Type').equalTo('application/json');
      expect(result.data).is('data').equalTo(JSON.stringify({key1: 'value1', key2: 'value2'}));
      expect(errors).is('errors').sameAs([]);
   })

   // Testing how the function handles multiple query parameters in a GET request
   it('Should process multiple query parameters for GET request',() => {
      const options = {href: 'http://example.com', method: 'GET', data: {key1: 'value1', key2: 'value2'}};
      const errors = [];
      const result = processData(options, errors);
      expect(result.search).is('search string').includes('?key1=value1&key2=value2');
      expect(result.data).isNot('data').defined();
      expect(errors).is('errors').sameAs([]);
   })

   // Testing how the function handles a GET request when search is already defined
   it('Should append query parameters to existing search for GET request',() => {
      const options = {href: 'http://example.com', method: 'GET', data: {key: 'value'}, search: '?existing=true'};
      const errors = [];
      const result = processData(options, errors);
      expect(result.search).is('search string').includes('?existing=true&key=value');
      expect(result.data).isNot('data').defined();
      expect(errors).is('errors').sameAs([]);
   })
})


runTests();
