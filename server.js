var library = require("nrtv-library")(require)

module.exports = library.export(
  "nrtv-server",
  ["http", "body-parser", library.collective({})],

  function(http, bodyParser, collective) {

    var express = require("express")

    function instance() {
      if (!collective.instance) {
        collective.instance = new Server()
      }

      return collective.instance
    }

    function Server() {
      var _this = this

      this.app = express()

      this.app.use(bodyParser.json())
    }

    Server.prototype.express =
      function() {
        return this.app
      }

    Server.express =
      function() {
        return instance().express()
      }

    Server.prototype.start = function(port) { 
      this.ensureStopped()
      this.sockets = sockets = []
      this.port = port

      this.server = http.createServer(this.app)
      this.server.listen(port)
      console.log('listening on', port)

      this.server.on('connection', function(socket) {
        sockets.push(socket)
        socket.setTimeout(4000)
        socket.on('close', function () {
          sockets.splice(sockets.indexOf(socket), 1)
        })
      })
    }

    Server.start = function(port) {
      instance().start(port)
    }

    Server.prototype.ensureStopped =
      function(message)  {
        if (this.port) {
          throw new Error("You already started this server. "+(message ? message : ""))
        }
      }

    Server.prototype.relenquishControl =
      function(start, stop) {
        this.ensureStopped("You have to override the start function before you start it.")

        if (!this.start || !this.stop) {
          throw new Error("If you want to relenquish control, you need to provide stop and start functions. Gas and brakes.")
        }
        this.start = start
        this.stop = stop
      }

    Server.relenquishControl = function(start) {
      instance().relenquishControl(start)
    }

    Server.prototype.stop =
      function (callback) {
        var port = this.port
        this.server.close(function () {
          console.log('Server closed!', port, 'should be free.')
          if (callback) { callback() }
        })
        this.sockets.forEach(function(socket) {
          socket.destroy()
        })
      }

    Server.stop = function(callback) {
      instance().stop(callback)
    }

    Server.prototype.get =
      function() {
        this.app.get.apply(this.app, arguments)
      }

    Server.get = function() {
      instance().get.apply(instance(), arguments)
    }

    Server.prototype.post =
      function() {
        this.app.post.apply(this.app, arguments)
      }

    Server.post =
      function() {
        instance().post.apply(instance(), arguments)
      }


    Server.prototype.static = express.static;

    Server.prototype.use = function() {
      this.app.use.apply(this.app, arguments)
    }

    return Server
  }
)
