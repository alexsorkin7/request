const FormData = require('form-data');
const Stream = require('stream')
const errorHandler = require('../error-handler')
class ReqData {
   constructor() {}
   processData(options, errors) {
      this.url = options.href
      let data = options.data
      if (data == undefined) return options;
      const excludes = ['GET', 'HEAD', 'DELETE'];

      if (data instanceof Buffer) return options // Buffer data doesn't require a specific Content-Type and can be used as body directly.
      else if (data instanceof FormData) this.handleFormData(options, data);
      else if (data instanceof Stream) this.handleStreamData(options, errors,data);
      else if (excludes.includes(options.method) && typeof data === 'object') this.handleObjectData(options, errors,data);
      else if (typeof data === 'object') this.handleJsonData(options, errors,data);
      else if (typeof data === 'string') this.handleStringData(options, data);
      else delete options.data;
      return options;
   }

   handleObjectData(options, errors, data) {
      let dataStr = ''
      const arr = Object.entries(data).map(([key, value]) => `${key}=${value}`)
      for (let i = 0; i < arr.length; i++) {
         if (dataStr.length+arr[i].length > 2000) {
            errors.push(errorHandler({code:'REQMAXDATA',url:this.url}))
            break
         }
         if (i > 0) dataStr += '&'
         dataStr += arr[i]
      }
      if (options.search == null) options.search = `?${dataStr}`
      else options.search += `&${dataStr}`
      options.path += options.search
      delete options.data
   }

   handleFormData(options, data) {
      options.headers = { ...options.headers, ...data.getHeaders() } // adding Content-Type:multipart/form-data
      options.formData = data
      delete options.data
   }

   handleJsonData(options,errors, data) {
      try { data = JSON.stringify(data) } catch (err) { 
         errors.push(errorHandler({code:'REQJSON',details:{data},url:this.url,err})) 
      }
      if (data.length > 2) {
         if(options.headers['Content-Type'] == undefined)
            options.headers['Content-Type'] = 'application/json';
         options.data = data
      }
   }

   handleStringData(options , data) { // set Content-Type and data if string data is received
      if(options.headers['Content-Type'] == undefined)
         options.headers['Content-Type'] = 'text/plain';
      options.data = data
   }

   handleStreamData(options, errors, data) { // Stream data can be used as body directly.
      data.on('error', (err) => errors.push(errorHandler({err,code:'REQSTREAM',url:this.url}))); // handle the 'error' event to avoid crashing if the stream errors.
      options.data = data;  
   }
}

module.exports = function (options, errors) {
   const reqData = new ReqData();
   return reqData.processData(options, errors);
}