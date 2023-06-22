const errors = {
   ORIGINWRONG: 'Can\'t set "Access-Control-Allow-Origin" because origin is not valid url',
   INVALIDURL: 'Url is not valid',
   IVALIDMAXAGE:'Max age for "Access-Control-Max-Age" is not a number',
   INVALIDMETHOD: 'Some method is not valid and excluded from "Access-Control-Allow-Methods"Access-Control-Allow-Methods" because it is not value method',
   RESDOUBLE:'You can\'t use stream and response at the same time',
   NOREQ:'Something wrong with request',
   REQMAXDATA:'Maximum url length achived. Some data key not included',
   REQJSON:'data is not vaid json',
   REQSTREAM:'Something wrong with streaming',
   INVALIDPROTOCOL:'Protocol not supported',
   REQERR:'Error in request'
}

module.exports = function(errorData={}) {
   let {msg='',code='NOCODE',url,err=null,details={},error} = errorData
   if(msg == '' && errors[code]) msg = errors[code]
   return {errorCode: code, errorMessage: msg,url,details,err,date:Date.now()}
}