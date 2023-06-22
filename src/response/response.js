const mime = require('./mime')
const canResponse = require('./can-response')
const { createWriteStream } = require('fs')
const jsonGetter = require('./json-getter')

class Response {
   constructor(request,dl) {
      this.request = request
      this.dl = dl
      this.promise = new Promise((resolve, reject) => {
         this.resolve = resolve
         this.reject = reject
      })
   }

   stream(path) {
      return this.execResponse(() => {
         let stream = createWriteStream(path)
         this.request.res.pipe(stream)
         stream.on('finish', () => this._end())
         stream.on('error', error => this.reject({error,errors:this.request.errors}))
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
  
   execResponse(fn) {
      const {url,req,onResponse} = this.request
      if(!canResponse(req,this.request.requester,this.processing,url,this.request.errors)) 
         return {errors:this.request.errors,error:null}
      this.processing = true
      req.on('response', () => {
         this.prepareResponse()
         this.download = true
         if(typeof onResponse === 'function') onResponse(this.request,this)
         this.request.res.on('error', error => this.reject(error));
         this.chunks = [];
         if(this.download) {
            this.loadTime = Date.now()
            this.waitTime = 0
            if(this.dl) this.dl.startChecking(this)
            this.request.res.on('data', chunk => this.chunks.push(chunk));
            fn()
         } else this.resolve(this.response)
      });
      return this.promise;
   }

   prepareResponse() {
      const {options,res,req,url,urlObj,errors} = this.request
      const {initTime} = options
      let { rawHeaders, method, headers, client, socket, responseUrl, statusCode } = res
      this.response = {
         status: statusCode, rawHeaders, responseUrl, headers, 
         client, socket,urlObj,
         idleTime: parseInt(Date.now() - initTime),
         error: null, errors,_redirects:[] 
      }
      this.addGetters(headers,url,this)
      req.on('error', error => this.reject(error))
      req.on('redirect', (res, options) => {
         this.response._redirects.push(`${options.hostname}${options.path}`)
      });
   }

   addGetters(headers,url,self) {
      Object.defineProperty(this.response, 'type', {get() {return mime(headers,url)}});
      Object.defineProperty(this.response, 'size', {
         get() {
            if(headers) {
               if(headers['content-length']) return headers['content-length']
            }
            return self.chunks.length
         }
      });
   }

   _end() {
      const {loadTime,waitTime=0} = this
      if(loadTime) {
         this.loadTime = Date.now() - loadTime - waitTime
         this.response.loadTime = parseInt(this.loadTime)
         this.response.waitTime = waitTime
         if(this.dl) this.dl.remove(this)
      }
      this.resolve(this.response)
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
}

module.exports = Response