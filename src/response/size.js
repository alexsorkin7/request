const {TextEncoder} = require('util');
module.exports = function(response) {
   const {headers={},data} = response
   if(headers['content-length']) return headers['content-length']
   if(!data) return 0
   const utf8Encoder = new TextEncoder(); // TextEncoder uses UTF-8 encoding by default
   const encodedText = utf8Encoder.encode(data);
   return encodedText.length;
}