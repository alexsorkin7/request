const errorHandler = require('../error-handler')
const { http, https } = require('follow-redirects');
const URL = require('url');
const isValidUrl = require('./is-valid-url')

function prepareRequest(originalUrl,referer,errors) {
   let url = isValidUrl(originalUrl,referer)
   if(url == false) {
      errors.push(errorHandler({code:'INVALIDURL',url}))
      return {requester:null,url:originalUrl,options:{headers:{}}}
   }
   let options = URL.parse(url, true)
   options.headers = {}
   const { protocol } = options
   const requester = protocol === 'http:' ? http : protocol === 'https:' ? https : null
   errors.push(errorHandler({code:'INVALIDPROTOCOL',url,details:{protocol}}))
   return {requester,url,options}
}

module.exports = prepareRequest