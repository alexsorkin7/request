const prepareRequest = require('./prepare-request')
const withCredentials = require('./with-credentials')
const getReqData = require('./req-data')
const Response = require('../response/response')
const DownloadLimiter = require('./download-limiter')
const errorHandler = require('../error-handler')

class Request {
   static limitSpeed(maxBytes) {
      if(isNaN(Number(maxBytes))) console.error('maxBytes parameter has to be number')
      else this.dl = new DownloadLimiter(maxBytes)
   }
   constructor(originalUrl,referer) {
      this.errors = []
      this.referer = referer
      let {requester,url,options,urlObj} = prepareRequest(originalUrl,referer,this.errors)
      this.requester = requester
      this.url = url
      this.urlObj = urlObj
      this.options = options
      this.options.initTime = Date.now()
      this.onPause
      this.onResume
      this.onResponse
   }

   withCredentials(options = {}) {
      const { origin = '*', maxAge = 2592000, methods = 'OPTIONS, POST, GET' } = options
      withCredentials(origin,maxAge,methods,this.options,this.errors)
      return this
   }

   setHeaders(headers) {
      this.options.headers = { ...this.options.headers, ...headers }
      return this
   }

   request(options={}) {
      if(this.requester === null) return this
      this._prepareRequest(options)
      this.req = this.requester.request(this.options, res => {
         this.res = res
      })
      this._afterRequest()
      let {dl} = this.constructor
      this._response = new Response(this,dl)
      return this
   }

   _prepareRequest(options) {
      options.priority = options.priority || 'e';
      for(const key in options) {
         this.options[key] = options[key]
      }
      if (this.options.method === undefined) this.options.method = 'GET'
      this.options.method = this.options.method.toUpperCase()
      this.options = getReqData(this.options,this.errors)
   }
   
   _afterRequest() {
      if(!this.req) return this.errors.push(errorHandler({code:'NOREQ',url:this.url}))
      let { data, formData } = this.options
      if (formData) formData.pipe(this.req)
      else if (data) {
         this.req.write(data)
         this.req.end()
      } else this.req.end()
      this.req.on('error', error => this.errors.push(errorHandler({code:'REQERR',url:this.url,err:error})))
   }

   response() {return this._response.$response()}
   stream(path) {return this._response.stream(path)}
}

module.exports = Request