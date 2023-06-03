var mime = require('mime-types')
module.exports = function(headers={},url) {
   let contentType = headers['content-type'];
   if (contentType) return mime.contentType(contentType) || null
   if(!url) return null
   let array = url.split('/')
   let fileName = array[array.length-1]
   return mime.contentType(fileName) || null
}