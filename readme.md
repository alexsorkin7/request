# als-request

`als-request` is a versatile HTTP client offering enhanced features for Node.js with functionality for speed limitation with events, CORS management, stream support, automatic data preparation, error and response handling, and more.

> The package has tested and all should work fine. Please report any bugs or issues you encounter.


## New in beta.2
* response object changes:
  * type
    * now it's getter
    * type fixed - now it's null or content type only without charset
  * size is getter
  * urlObj - new in response
* excludeDownloadForContentTypes removed - use onResponse hook instead
* new hook - onResponse(request,responseObj)
  * available responseObj.response
  * responseObj.download = false - preventing downloading
* onPause and onResume hooks in options - fixed
* fixed adding `INVALIDPROTOCOL` error to all requests


## Installation and Usage
To install, use npm:

```sh
npm install als-request
```

To import the Request module into your code:

```js
const Request = require('als-request');
```

## Quick Start

Here's an example of how you can use the fetch and post methods:

```js
const {fetch, post} = require('als-request');
const data = {title: 'foo',body: 'bar',userId: 1};
const url = 'https://jsonplaceholder.typicode.com/posts';

// Using Promises
fetch(url).then(res => console.log(res.json));
post(url,{data}).then(res => console.log(res.json));

// Using async/await
(async function() {
   const res1 = await fetch(url)
   const res2 = await post(url,{data})
   console.log(res1.json)
   console.log(res2.json)
})()
```

## Basic Static Methods

You can use the following static methods:
```js
Request.fetch(url:string,options:object,method:string):Promise
Request.get(url:string,options):Promise
Request.post(url:string,options):Promise
Request.head(url:string,options):Promise
Request.delete(url:string,options):Promise
Request.put(url:string,options):Promise
Request.patch(url:string,options):Promise
```

In the above methods:

* `url`: The target URL for the request.
* `options`: A configuration object for the request (detailed below).
* `method`: Optional; primarily for internal use.


## Request Configuration Options
The options object can contain the following properties:

* `method` (default: 'GET'): The HTTP request method ('GET', 'POST', etc.).
* `data`: The data payload to be sent with the request.
* `priority` (default: 'e'): The priority level of the request, can be 'a', 'b', 'c', 'd', or 'e'.
* `maxBytes`: The maximum byte size for the request.
* `path` (default: undefined): A file path to save the response streaming data to (full path).
* `withCredentials` (default: undefined or { origin: '*', maxAge: 2592000, methods: 'OPTIONS, POST, GET' }): The credentials for Access-Control request headers.
* `referer` (default: undefined): The referer URL. If specified and the target URL is relative, the target URL will be built from this referer.
* `headers` (default: {}): The request headers.
* Hooks - each hook is a function which getting two parameters:request and response instance
  * `onPause`: A function to execute when the request is paused.
  * `onResume`: A function to execute when the request resumes.
  * `onResponse`: A function to execute after headers has recieved
* follow-redirects options (https://www.npmjs.com/package/follow-redirects for more details)
  * `followRedirects` (default: true) – whether redirects should be followed.
  * `maxRedirects` (default: 21) – sets the maximum number of allowed redirects; if exceeded, an error will be emitted.
  * `maxBodyLength` (default: 10MB) – sets the maximum size of the request body; if exceeded, an error will be emitted.
  * `beforeRedirect` (default: undefined) – optionally change the request options on redirects, or abort the request by throwing an error.
  * `agents` (default: undefined) – sets the agent option per protocol, since HTTP and HTTPS use different agents. Example value: { http: new http.Agent(), https: new https.Agent() }
  * `trackRedirects` (default: false) – whether to store the redirected response details into the redirects array on the response object.


## Using hooks

`Request` has 3 hooks: `onPause`,`onResponse`,`onResume`.
Each hook getting `request` and `responseObj` as parameters. 
The `onPause` and `onResume` hooks used only then download limiter defined (then `maxBytes` defined in options). 

The `onResponse` hook, executed right before downloading or streaming data and allows you to read headers and to prevent download. 

Example:
```js
let imageNotDownloaded = false
await Request.fetch('http://example.com/some-image.jpg',{
  onResponse:(req,resObj) => {
    if(resObj.response.size > 1024*1024*5) {
      resObj.download = false
      imageNotDownloaded = true
    }
  }
})
```

On example above, onResponse hook preventing downloading if file size bigger then 5MB.


## Relative url and referer
In `als-request`, the `referer` parameter serves a more specific purpose compared to its typical usage in HTTP. When constructing a URL that is not an absolute URL (i.e., it doesn't start with 'http'), the `referer` is used as the base URL.

When using the `Request` constructor, if the original `url` does not start with 'http', `referer` is used to construct a full URL. This is especially useful when you have relative URLs and you want to resolve them against a base URL.

Here's an example:

```javascript
const Request = require('als-request');

// A typical usage of the 'referer' parameter when making a request

let req1 = new Request('/page2', 'https://example.com/page1');
req1.request(); 
// The requested url is: https://example.com/page2


// Another example:
let data = { message: 'Hello world' };
let req2 = new Request('api/posts', 'https://example.com/home');
req2.request({
  method: 'POST',
  data: { message: 'Hello world' }
});
// The requested url is: https://example.com/home/api/posts
```


# Automatic Data Processing
The ReqData module of `als-request` automatically preprocesses the `data` provided in `options` based on its type and the HTTP method of the request. It handles `Buffer`, `FormData`, `Stream`, `object`, and `string` types.

Data processing is done as follows:
* `Buffer`: No modifications are made, the data can be used as the request body directly.
* `FormData`: Headers from the FormData object are merged with the existing headers in options, and the FormData object is assigned to `options.formData`.
* `Stream`: The stream is assigned to `options.data`. An 'error' listener is added to handle potential stream errors.
* `object` (for 'GET', 'HEAD', 'DELETE' methods): The object is converted into a URL query string and appended to the URL. If the resulting string exceeds 2000 characters, the process stops and an error is logged.
* `object` (for other methods): The object is stringified and assigned to `options.data`, and the 'Content-Type' header is set to 'application/json' if not already set.
* `string`: The string is assigned to `options.data`, and the 'Content-Type' is set to 'text/plain' if not already set.


## Response Structure

The resolved response object contains the following properties:

* `status`: HTTP status code.
* `rawHeaders`: Raw response headers.
* `responseUrl`: Final URL after redirects.
* `headers`: Processed response headers.
* `idleTime`: The time spent waiting for the server to start sending the response.
* `error`: Any errors occurred while making the request.
* `errors`: An array of error objects for each error that occurred while making the request
  * Error handling described further.
* `type`: The MIME type of the response (getter)
* `loadTime`: Time it took to load the response.
* `waitTime`: Time spent waiting while the response was paused.
* `_redirects`: An array of URLs that the request was redirected through.
* `json`: A getter method that tries to parse data as JSON and return the result
* `size`: Size of data in bytes (getter).
  * checks size in headers. If size in headers not available return number of downloaded chunks.
* `client`:The HTTP client instance.
* `socket`:The network socket instance.
* `urlObj`: url parsed object


## Limiting Download Speed
The `als-request` package includes a built-in module for limiting the download speed of response data. Use `Request.limitSpeed(maxBytes)` to specify the maximum number of bytes that can be downloaded concurrently. The `maxBytes` parameter is required and must be a number.

Downloads are paused and resumed based on their assigned priority (specified in the request options). By default, each download is assigned the lowest priority ('e'). If `options.onPause` and `options.onResume` are defined, these functions will be called each time a download is paused or resumed.


### Excluding Download For Certain Content Types
Use `Request.excludeDownloadForContentTypes` to specify a list of MIME types for which download should be skipped.


## Making Requests with Constructor
In addition to the static methods, you can use the Request constructor to create a request:

```js
let req = new Request('https://example.com').request();
```
The Request constructor takes two parameters:

* `originalUrl` (string) - the URL to make the request to.
* `referer` (string, optional) - the referer URL.
The request method takes an optional options object where you can specify request options:

```js
let req = new Request('https://example.com').request({
  method: 'POST', // HTTP method, e.g. 'GET', 'POST', etc.
  data: { message: 'Hello world' }, // data to send in the request body
  priority: 'a', // priority level, it can be 'a', 'b', 'c', 'd', 'e'
});
```

To get the response of a request, call the response method on the request instance:

```js
req.response().then(response => {
  console.log(response.status); // HTTP status code
  console.log(response.data); // response data
}).catch(err => {
  console.error(err); // handle any errors
});
```


## Streaming a response
You can stream the response data to a file using the stream method. This method takes the path of the file to write to:

```js
req.stream('./response.txt').catch(err => {
  console.error(err); // handle any errors
});
```

## Setting request headers
You can set additional request headers using the setHeaders method:

```js
let req = new Request('https://example.com');
req.setHeaders({
  'User-Agent': 'My custom user agent',
  'Authorization': 'Bearer my-token',
});
req.request();
```

## Setting request credentials
Use the withCredentials method to set request credentials:

```js
let req = new Request('https://example.com');
req.withCredentials({
  origin: 'https://example.com', // the value for Access-Control-Allow-Origin header. Default "*"
  maxAge: 2592000, // maximum age for the CORS preflight request. Default 2592000
  methods:'GET POST' // default 'OPTIONS, POST, GET'
});
req.request();
```

## Usage examples

```javascript
const Request = require('request');

let req = new Request('https://example.com');
req.withCredentials()
   .setHeaders({'User-Agent': 'Mozilla/5.0'})
   .request();

let response = await req.response();
console.log(response.json);

req.stream('./file.txt');
```

## Errors

Each error has the folowing structure:
```js
error = {
   errorCode:string, 
   errorMessage:string,
   url:string,
   details:object,
   err:Error,
   date:Date.now()
}
```

Error codes:
```js
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
   INVALIDPROTOCOL:'Protocol not supported'
}
```
