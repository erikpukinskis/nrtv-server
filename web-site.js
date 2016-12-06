var library = require("module-library")(require)

module.exports = library.export(
  "web-site",
  [library.collective({}), "http", "body-parser", "cookie-parser"],

  function(collective, http, bodyParser, cookieParser) {

    var express = require("express")

    function Server() {
      var _this = this

      this.app = express()

      this.app.use(bodyParser.json())
      this.app.use(bodyParser.urlencoded({ extended: true }))
      this.app.use(cookieParser())
      this.stop = stop.bind(this)
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
      } else {
        this.server = http.createServer(this.app)
        this.server.listen(port)
        console.log('listening on', port)
      }

      this.server.on('connection', function(socket) {
        sockets.push(socket)
        socket.setTimeout(4000)
        socket.on('close', function () {
          sockets.splice(sockets.indexOf(socket), 1)
        })
      })
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

    Server.prototype.addRoute =
      function(verb, pattern, handler) {
        this.app[verb](
          pattern,
          wrap.bind(null, handler)
        )
      }

    function deprecated(verb) {
      console.log(" ⚡⚡⚡ WARNING ⚡⚡⚡  server."+verb+" is deprecated. Use server.addRoute instead.")
    }

    Server.prototype.get =
      function(pattern, handler) {
        deprecated("get")
        this.app.get(
          pattern,
          wrap.bind(null, handler)
        )
      }

    Server.prototype.post =
      function(pattern, handler) {
        console.log(" ⚡⚡⚡ WARNING ⚡⚡⚡  server.post is deprecated. Use server.addRoute instead.")
        this.app.post(
          pattern,
          wrap.bind(null, handler)
        )
      }

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

    Server.prototype.use = function() {
      this.app.use.apply(this.app, arguments)
    }

    library.collectivize(
      Server,
      collective,
      ["express", "start", "relenquishControl", "stop", "addRoute", "get", "post", "use", "getPort", "isStarted"]
    )

    return Server
  }
)
