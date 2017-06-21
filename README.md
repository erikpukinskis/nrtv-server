**web-site** is a wrapper for Express that adds the things it boneheadedly leaves out by default:

```javascript
var WebSite = require("web-site")

var site = new WebSite()
site.addRoute("get", "/", function(request,response) {
  response.send("okay")
})
site.start(4100)
site.stop()
```

## Why

In the name of modularity, Express has stopped doing basic web server things by default. Like stopping. Or parsing form data. Or handling AJAX requests. These things are the most basic, fundamental activities of a web server, it's OK to load them by default.

## Features

* Parses submitted forms by default
* Parses JSON forms by default
* Parses cookies by default
* site.stop()
* site.isStarted()
* site.getPort()

## BYOHS (Bring Your Own HTTP Server)

If you want to tell the web site to use a different http server, you can ask it to relinquish control of starting and stopping:

```javascript
var site = new WebSite()
site.addRoute(...)

site.relinquishControl(function() {
  var httpServer = ...

  // we can start this here, or wait, or whatever

  // Then we return the httpServer so the routes can go into that instead:
  return httpServer
}
```

See [get-socket](https://github.com/erikpukinskis/get-socket/blob/master/get-socket.js#L77) for an example.

## sendFile

A method for static files is included just so you don't have to include the path module:

```javascript
site.addRoute(
  "/some-script.js",
  site.sendFile(__dirname, "path/to/your/jazz.js")
)
```
