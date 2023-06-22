const {URL} = require('url')
function isValidUrl(url,referer) {
   url = encodeURI(url)
   if(!url || /^(\#|mailto\:|tel\:)/.test(url)) return false;
   if(!url.startsWith('http') && referer) {
      let {origin,pathname} = new URL(referer);
      if(/^\//.test(url)) url = origin + url; // If url is root-relative
      else if(pathname !== '/') { // If url is relative to the current path
         if(!pathname.endsWith('/')) pathname += '/';
         url = origin + pathname + url;
      } else url = url.startsWith('/') ? origin + url : origin + '/' + url;  // If url is relative but the pathname is '/', and url does not start with '/'
   }
   try {
      const urlObj = new URL(url);
      return {url,urlObj};
   } catch {return false;}
}

module.exports = isValidUrl