var library = require("nrtv-library")(require)

module.exports = library.export(
  "server",
  ["http", "body-parser", library.collective({})],
  function(http, bodyParser, collective) {

    var express = require("express")

    function Server() {
      var _this = this

      this.app = express()

      this.app.use(bodyParser.json())
    }

    Server.collective = function() {
      if (!collective.instance) {
        collective.instance = new Server()
      }

      return collective.instance
    }

    Server.prototype.start = function(port) { 
      if (this.port) {
        throw new Error("You already started this server.")
      }
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

    Server.prototype.get =
      function() {
        this.app.get.apply(this.app, arguments)
      }

    Server.prototype.post =
      function() {
        this.app.post.apply(this.app, arguments)
      }

    Server.prototype.static = express.static;

    Server.prototype.use = function() {
      this.app.use.apply(this.app, arguments)
    }

    return Server
  }
)
