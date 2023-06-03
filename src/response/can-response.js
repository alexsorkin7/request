const errorHandler = require('../error-handler')
module.exports = function canResponse(req,requester,processing,url,errors) {
   if(!requester) return false
   if(!req) {
      errors.push(errorHandler({code:'NOREQ',url}))
      return false
   }
   if(processing ) {
      errors.push(errorHandler({code:'RESDOUBLE',url}))
      return false
   }
   return true
}
