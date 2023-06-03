const errorHandler = require('../error-handler')
const isValidUrl = require('./is-valid-url')

module.exports = function withCredentials(origin = '*', maxAge = 2592000, methods = 'OPTIONS, POST, GET',url,options = {},errors=[]) {
   if(isValidUrl(origin) || origin == '*') options.headers['Access-Control-Allow-Origin'] = origin
   else errors.push(errorHandler({code:'ORIGINWRONG',url,details:{origin}}))
   
   if(Number.isInteger(maxAge)) options.headers['Access-Control-Max-Age'] = maxAge
   else errors.push(errorHandler({code:'IVALIDMAXAGE',url,details:{maxAge}}))

   const httpMethods = ["GET", "HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"];
   methods = methods.split(',').filter(method => {
      if(method == '') return false
      if(httpMethods.includes(method.trim())) return true
      else errors.push(errorHandler({code:'INVALIDMETHOD',details:{method},url}))
      return false
   }).join()
   options.headers['Access-Control-Allow-Methods'] = methods
}