const mime = require('./mime')
const canResponse = require('./can-response')
const { createWriteStream } = require('fs')
const size = require('./size')
const jsonGetter = require('./json-getter')

class Response {
   constructor(request,dl,excludeDownloadForContentTypes) {
      this.request = request
      this.excludeDownloadForContentTypes = excludeDownloadForContentTypes
      this.dl = dl
      this.promise = new Promise((resolve, reject) => {
         this.resolve = resolve
         this.reject = reject
      })
   }
   
   prepareResponse() {
      const {options,res,req,url} = this.request
      const {initTime} = options
      let { rawHeaders, method, headers, client, socket, responseUrl, statusCode } = res
      this.response = {
         status: statusCode, rawHeaders, responseUrl, headers, 
         client, socket,
         idleTime: parseInt(Date.now() - initTime),
         error: null, errors: this.request.errors,_redirects:[] 
      }
      this.response.type = mime(headers,url)
      if(this.response.type) this.dontDownload = this.excludeDownloadForContentTypes.includes(this.response.type);
      req.on('error', error => this.reject(error))
      req.on('redirect', (res, options) => {
         this.response._redirects.push(`${options.hostname}${options.path}`)
      });
   }

   stream(path) {
      return this.execResponse(() => {
         let stream = createWriteStream(path)
         this.request.res.pipe(stream)
         stream.on('finish', () => this._end())
         stream.on('error', error => this.reject(error))
      })
   }

   $response() {
      return this.execResponse(() => {
         jsonGetter(this.response)
         this.request.res.on('end', () => {
            let buffer = Buffer.concat(this.chunks);
            if (buffer) this.response.data = buffer.toString("utf8");
            this._end();
         });
      })
   }
  
   pause() {
      const {onPause} = this.request
      if(typeof onPause == 'function') onPause(this.request,this)
      this.request.res.pause()
      this.paused = true
      this.waitStartTime = Date.now()
   }

   resume() {
      const {onResume} = this.request
      if(typeof onResume == 'function') onResume(this.request,this)
      this.request.res.resume()
      this.paused = false
      if(this.waitStartTime) {
         this.waitTime += Date.now() - this.waitStartTime
         this.waitStartTime = null; // reset waitStartTim
      }
   }

   execResponse(fn) {
      const {url,req} = this.request
      if(!canResponse(req,this.request.requester,this.processing,url,this.request.errors)) 
         return {errors:this.request.errors}
      this.processing = true
      req.on('response', () => {
         this.prepareResponse()
         this.loadTime = Date.now()
         this.waitTime = 0
         this.chunks = [];
         if(this.dontDownload) return this._end()
         if(this.dl) this.dl.startChecking(this)
         this.request.res.on('data', chunk => this.chunks.push(chunk));
         fn()
         this.request.res.on('error', error => this.reject(error));
      });
      return this.promise;
   }

   _end() {
      const {loadTime,waitTime=0} = this
      if(loadTime) {
         this.loadTime = Date.now() - loadTime - waitTime
         this.response.loadTime = parseInt(this.loadTime)
         this.response.waitTime = waitTime
         if(this.dl) this.dl.remove(this)
      }
      this.response.size = size(this.response) || this.chunks.length
      this.resolve(this.response)
   }
}

module.exports = Response