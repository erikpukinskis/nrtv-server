var library = require("module-library")(require)

module.exports = library.export(
  "web-site",
  ["with-nearby-modules", "http", "body-parser", "cookie-parser", "path", "compression"],

  function(withNearbyModules, http, bodyParser, cookieParser, path, compression) {

    var express = require("express")

    function Server(app) {
      this.app = app || express()
      this.app.use(compression({level: 1}))
      this.app.use(bodyParser.json())
      this.app.use(bodyParser.urlencoded({ extended: true }))
      this.app.use(cookieParser())
      this.stop = stop.bind(this)
      this.memories = {}
      this.__isNrtvWebSite = true
    }

    Server.prototype.remember = function(key) {
      return this.memories[key]
    }

    Server.prototype.see = function(key, object) {
      this.memories[key] = object
    }

    Server.prototype.express =
      function() {
        return this.app
      }

    Server.prototype.isStarted =
      function() {
        return !!this.port
      }

    Server.prototype.start = function(port) { 
      this.ensureStopped()
      this.sockets = sockets = []
      this.port = port || 5678

      if (this.startOverride) {
        this.server = this.startOverride(port)

        if (!this.server) {
          throw new Error("The start function you gave us needs to return an http server so we can monitor the sockets and stuff! The function you gave us looks like this:\n"+this.startOverride.toString()+"\n")
        }

        console.log(startStatus(this, port))

      } else {
        this.server = http.createServer(
          this.app)

        this.server.listen(
          port)
        .on(
          "error",
          errorWithPort.bind(
            null,
            port))

        console.log(
          "web-site starting on",
          port)
      }

      this.server.on('connection', function(socket) {
        sockets.push(socket)
        socket.setTimeout(4000)
        socket.on('close', function () {
          sockets.splice(sockets.indexOf(socket), 1)
        })
      })
    }

    function startStatus(site, port) {
      if (site.startOverride.name) {
        var overrideName = "the "+site.startOverride.name+" function"
      } else {
        var overrideName = "an unnamed override function"
      } 

      if (port) {
        return "web-site ostensibly started by "+overrideName+" on "+port
      } else {
        return "web-site ostensibly started by "+overrideName+" without a port"
      }
    }


    function errorWithPort(port, error) {
      error.message += " (port "+port+")"
      throw error
    }

    Server.prototype.getPort =
      function() { return this.port }

    Server.prototype.ensureStopped =
      function(message)  {
        if (this.port) {
          throw new Error("You already started this server. "+(message ? message : ""))
        }
      }

    Server.prototype.relenquishControl =
      function(start) {
        this.ensureStopped("You have to override the start function before you start it.")

        this.startOverride = start
      }

    function stop(callback) {
      var port = this.port

      this.server.close(function () {
        console.log('Server closed!', port, 'should be free.')
        if (callback) { callback() }
      })

      this.sockets.forEach(function(socket) {
        socket.destroy()
      })
    }

    var ALLOWED_VERBS = "get, post, put, head, delete, options, trace, copy, lock, mkcol, move, purge, propfind, proppatch, unlock, report, mkactivity, checkout, merge, m-search, notify, subscribe, unsubscribe, patch, search, connect".split(", ")

    function verbOk(verb) {
      var i = ALLOWED_VERBS.indexOf(verb.toLowerCase())
      return i >= 0
    }

    Server.prototype.addRoute =
      function(verb, pattern, handler) {
        if (!verbOk(verb)) {
          throw new Error("webSite.addRoute expects an HTTP verb as the first argument. You passed \""+verb+"\". Valid verbs are "+ALLOWED_VERBS)
        }

        this.app[verb](
          pattern,
          wrap.bind(null, handler)
        )
      }

    function deprecated(verb) {

    }

    Server.prototype.get =
      function(pattern, handler) {
      throw new Error("site.get is no longer supported. Use site.addRoute(\"get\", \"/route-to\", function handler(request, response) { ... }) instead.")}


    Server.prototype.post =
      function(pattern, handler) {
      throw new Error("site.post is no longer supported. Use site.addRoute(\"post\", \"/resource\", function handler(request, response) { ... }) instead.")}

    function wrap(handler, request, response) {
      try {
        handler(request, response)
      } catch (e) {
        var lines = e.stack.split("\n")

        console.log("\n ⚡⚡⚡ REQUEST ERROR ⚡⚡⚡\n\n"+lines[0])

        console.log(lines.slice(1).join("\n"))
      }
    }

    Server.prototype.static = express.static;

    Server.prototype.use = function(server) {
      if (server.__isNrtvWebSite) {
        server.memories = this.memories
      }
      this.app.use.apply(this.app, arguments)
    }

    Server.prototype.sendFile = function(pathToFolder, pathToFile) {
      var fullPath = path.join(pathToFolder, pathToFile)

      return sendFile.bind(null, fullPath)
    }

    function sendFile(pathToFile, request, response) {

      response.sendFile(pathToFile)
    }

    return Server
  }
)
