var mime = require('mime-types')
module.exports = function(headers={},url) {
   let contentType = headers['content-type'];
   try {
      if (contentType) return contentType.split(';')[0]
   } catch (error) {
      return null
   }
   if(!url) return null
   return mime.lookup(url) || null
}