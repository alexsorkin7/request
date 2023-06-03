let Request = require('./request/request')

Request.fetch = function(url,options={},method) {
   if(method) options.method = method
   const keys = ['maxBytes','excludeDownloadForContentTypes','path','withCredentials', 'referer','headers', 'onPause','onResume']
   const {maxBytes,excludeDownloadForContentTypes=[],path,withCredentials, referer,headers={}, onPause,onResume} = options
   if(maxBytes) Request.limitSpeed(maxBytes)
   Request.excludeDownloadForContentTypes = excludeDownloadForContentTypes
   const obj = new Request(url,referer)
   obj.setHeaders(headers)
   if(typeof onPause == 'function') Request.onPause = onPause
   if(typeof onResume == 'function') Request.onResume = onResume
   if(withCredentials) obj.withCredentials(withCredentials)
   keys.forEach(key => { // separate left options from extracted and run request(options)
      delete options[key]
   });
   return path ? obj.request(options).stream(path) : obj.request(options).response()
}

Request.get = (url,options) => Request.fetch(url,options,'get')
Request.post = (url,options) => Request.fetch(url,options,'post')
Request.head = (url,options) => Request.fetch(url,options,'head')
Request.delete = (url,options) => Request.fetch(url,options,'delete')
Request.put = (url,options) => Request.fetch(url,options,'put')
Request.patch = (url,options) => Request.fetch(url,options,'patch')

module.exports = Request