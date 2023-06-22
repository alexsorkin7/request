const errorHandler = require('../error-handler')
const { http, https } = require('follow-redirects');
const URL = require('url');
const isValidUrl = require('./is-valid-url')

function prepareRequest(originalUrl,referer,errors) {
   let result = isValidUrl(originalUrl,referer)
   if(result == false) {
      errors.push(errorHandler({code:'INVALIDURL',url:originalUrl}))
      return {requester:null,url:originalUrl,options:{headers:{}}}
   }
   let {url,urlObj} = result
   let options = URL.parse(url, true)
   options.headers = {}
   const { protocol } = options
   const requester = protocol === 'http:' ? http : protocol === 'https:' ? https : null
   if(requester === null) errors.push(errorHandler({code:'INVALIDPROTOCOL',url,details:{protocol}}))
   return {requester,url,options,urlObj}
}

module.exports = prepareRequest