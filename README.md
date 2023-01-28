<h1 align="center">
   <b>
        <img src="https://imagedelivery.net/aEWS_agrry4gR3sWZKZItw/85842087-07b3-4640-0bf1-d82e838fe200/w=max" /><br>
    </b>
</h1>

<p align="center">Promise based HTTP/1.1 HTTP/2.0 client with ZSTD support for NodeJS (only for server-side). I've created it for my personal usage in a specific project so, I decided to share code with the community. I hope this can help anyone.</p>

<div align="center">

[![npm version](https://img.shields.io/npm/v/nexus-request.svg?style=flat-square)](https://www.npmjs.org/package/nexus-request)
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod&style=flat-square)](https://gitpod.io/#https://github.com/kaykyr/nexusjs)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=nexus-request&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=nexus-request)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/nexus-request?style=flat-square)](https://bundlephobia.com/package/nexus-request@latest)
[![npm downloads](https://img.shields.io/npm/dm/nexus-request.svg?style=flat-square)](https://npm-stat.com/charts.html?package=nexus-request)
[![gitter chat](https://img.shields.io/gitter/room/mzabriskie/nexus-request.svg?style=flat-square)](https://gitter.im/mzabriskie/nexus-request)
[![Known Vulnerabilities](https://snyk.io/test/npm/nexus-request/badge.svg)](https://snyk.io/test/npm/nexus-request)

</div>

## Features

- Make [http](https://nodejs.org/api/http.html) and [http2](https://nodejs.org/api/http2.html) requests from node.js
- Supports the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) API
- Intercept response
- Decompress ZSTD response
- Transform request and response data
- Automatic transforms for [JSON](https://www.json.org/json-en.html) data

## Installing

### Package manager

Using npm:

```bash
$ npm install nexus-request
```

Using yarn:

```bash
$ yarn add nexus-request
```

Once the package is installed, you can import the library using `import` or `require` approach:

```js
import { Nexus, NexusException } from 'nexus-request'
```

You can also use the default export, since the named export is a export of Nexus class instance calling rawRequest method:

```js
import nexus from 'nexus-request'

const response = await nexus('https://httpbin.org/post', {
    method: 'post',
    http2: true,
    proxy: 'http://127.0.0.1:8080',
    setURLEncoded: false,
    response: {
        transformJson: true,
        stringifyBigInt: true,
        forceCamelCase: true,
    },
})

console.log('Response: ', response.data)
```

## Example

> **Note** CommonJS usage
> In order to gain the TypeScript typings (for intellisense / autocomplete) while using CommonJS imports with `require()`, use the following approach:

```js
import { Nexus } from 'nexus-request'

const nexus = new Nexus()

// Make a request for a user with a given ID
nexus.get('/user?ID=12345')
  .then(function (response) {
    // handle success
    console.log(response)
  })
  .catch(function (error) {
    // handle error
    console.log(error)
  })
  .finally(function () {
    // always executed
  })

// Make a request for a user with a given ID (Nexus Way)
nexus.get('/user')
  .addParam('ID', 12345)
  .then(function (response) {
    // handle success
    console.log(response)
  })
  .catch(function (error) {
    // handle error
    console.log(error)
  })
  .finally(function () {
    // always executed
  })

// Optionally the request above could also be done as
nexus.get('/user', {
    params: {
      ID: 12345
    }
  })
  .then(function (response) {
    console.log(response)
  })
  .catch(function (error) {
    console.log(error)
  })
  .finally(function () {
    // always executed
  })

// Want to use async/await? Add the `async` keyword to your outer function/method.
async function getUser() {
  try {
    const response = await nexus.get('/user').addParam('ID', 12345)
    console.log(response)
  } catch (error) {
    console.error(error)
  }
}
```

> **Note** `async/await` is part of ECMAScript 2017 and is not supported in Internet
> Explorer and older browsers, so use with caution.

Performing a `POST` request

```js
nexus.post('/user')
  .addPost('firstName', 'Fred')
  .addPost('lastName', 'Flintstone')
  .then(function (response) {
    console.log(response)
  })
  .catch(function (error) {
    console.log(error)
  })

// Optionally the request above could also be done as
nexus.post('/user', {
    data: {
        firstName: 'Fred',
        lastName: 'Flintstone'
    }
  })
  .then(function (response) {
    console.log(response)
  })
  .catch(function (error) {
    console.log(error)
  })
```

Performing multiple concurrent requests

```js
function getUserAccount() {
  return nexus.get('/user/12345')
}

function getUserPermissions() {
  return nexus.get('/user/12345/permissions')
}

Promise.all([getUserAccount(), getUserPermissions()])
  .then(function (results) {
    const acct = results[0]
    const perm = results[1]
  })
```

## Nexus API

Requests can be made by passing the relevant config to `nexus`.

##### nexus(url, config)

```js
// Send a POST request
import nexus from 'nexus-request'

nexus('https://httpbin.org/post', {
  method: 'post',
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
})

```

### Creating an instance

You can create a new instance of nexus with a custom config.

##### nexus.create([config])

```js
import { Nexus } from 'nexus-request'

const instance = new Nexus({
  baseURL: 'https://httpbin.org/',
  headers: {'X-Custom-Header': 'foobar'},
  response: {
    transformJson: true,
    stringifyBigInt: true,
    forceCamelCase: true,
  }
});
```

### Instance methods

The available instance methods are listed below. The specified config will be merged with the instance config.

##### nexus#get(url[, config])

##### nexus#delete(url[, config])

##### nexus#post(url[, data[, config]])

##### nexus#put(url[, data[, config]])

## Request Config

These are the available config options for making requests. Only the `url` is required. Requests will default to `GET` if `method` is not specified.

```js
{
  // `url` is the server URL that will be used for the request
  url | path: '/user',

  // `method` is the request method to be used when making the request
  method: 'get', // default

  // `baseURL` will be prepended to `url` unless `url` is absolute.
  // It can be convenient to set `baseURL` for an instance of nexus to pass relative URLs
  // to methods of that instance.
  baseURL: 'https://some-domain.com/api/',

  // `transformResponse` allows changes to the response data to be made before
  // it is passed to then/catch
  responseTransformer: [function (data) {
    // Do whatever you want to transform the data

    return data;
  }],

  // `headers` are custom headers to be sent
  headers: {'X-Requested-With': 'XMLHttpRequest'},

  // `params` are the URL parameters to be sent with the request
  // Must be a plain object or a URLSearchParams object
  params: {
    ID: 12345
  },

  // `data` is the data to be sent as the request body
  // Only applicable for request methods 'PUT', 'POST', 'DELETE , and 'PATCH'
  // When no `transformRequest` is set, must be of one of the following types:
  // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
  // - Browser only: FormData, File, Blob
  // - Node only: Stream, Buffer, FormData (form-data package)
  data: {
    firstName: 'Fred'
  },

  // syntax alternative to send data into the body
  // method post
  // only the value is sent, not the key
  data: 'Country=Brasil&City=Belo Horizonte',


  // `responseEncoding` indicates encoding to use for decoding responses (Node.js only)
  // Note: Ignored for `responseType` of 'stream' or client-side requests
  encoding: 'utf8', // default

  // `proxy` defines the hostname, port, and protocol of the proxy server.
  // You can also define your proxy using the conventional `http_proxy` and
  // `https_proxy` environment variables. If you are using environment variables
  // for your proxy configuration, you can also define a `no_proxy` environment
  // variable as a comma-separated list of domains that should not be proxied.
  // Use `false` to disable proxies, ignoring environment variables.
  // `auth` indicates that HTTP Basic auth should be used to connect to the proxy, and
  // supplies credentials.
  // This will set an `Proxy-Authorization` header, overwriting any existing
  // `Proxy-Authorization` custom headers you have set using `headers`.
  // If the proxy server uses HTTPS, then you must set the protocol to `https`.
  proxy: 'http://user:pass@host:port',

  // `decompress` indicates whether or not the response body should be decompressed
  // automatically. If set to `true` will also remove the 'content-encoding' header
  // from the responses objects of all decompressed responses
  // - Node only (XHR cannot turn off decompression)
  decompress: true // default
}
```

## Response Schema

The response for a request contains the following information.

```js
{
  // `data` is the response that was provided by the server
  data: {},

  // `status` is the HTTP status code from the server response
  statusCode: 200,

  // `statusText` is the HTTP status message from the server response
  statusText: 'OK',

  // `headers` the HTTP headers that the server responded with
  // All header names are lowercase and can be accessed using the bracket notation.
  // Example: `response.headers['content-type']`
  headers: {},

  // `config` is the config that was provided to `nexus` for the request
  data: {},
}
```

## Nexus Response Exception Schema

The response for a request contains the following information.

```js
{
  // `data` is the response that was provided by the server
  data: {},

  // `status` is the HTTP status code from the server response
  statusCode: 200,

  // `statusText` is the HTTP status message from the server response
  statusText: 'OK',

  // `headers` the HTTP headers that the server responded with
  // All header names are lowercase and can be accessed using the bracket notation.
  // Example: `response.headers['content-type']`
  headers: {},

  // `config` is the config that was provided to `nexus` for the request
  data: {},

  // `request` is the request that generated this response
  // It is the last ClientRequest instance in node.js (in redirects)
  // and an XMLHttpRequest instance in the browser
  request: {}
}
```

## License

[MIT](LICENSE)
