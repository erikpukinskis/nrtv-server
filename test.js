var runTest = require("run-test")(require)

runTest(
  "sending text",
  ["./", "supertest"],
  function(expect, done, Server, request) {

    var instance = new Server()

    instance.addRoute(
      "get",
      "/",
      function(x, response) {
        response.send("hiya!")
      }
    )

    instance.start(5511)

    request(
      "http://localhost:5511"
    )
    .get("/")
    .end(function(x, response) {
      expect(response.text).to.match(
        /hiya/
      )
      instance.stop()
      done()
    })

  }
)


runTest(
  "getting a collective instance",
  ["./", "supertest"],
  function(expect, done, Server, request) {

    Server.addRoute(
      "get",
      "/",
      function(x, response) {
        response.send("pants")
      }
    )

    Server.start(4000)

    request(
      "http://localhost:4000"
    )
    .get("/")
    .end(function(x, response) {
      expect(response.text).to.match(
        /pants/
      )
      Server.stop()
      done()
    })

  }
)


runTest(
  "you can provide your own server startup function",

  ["./", "http"],
  function(expect, done, Server, http) {

    var server = new Server()
    var started = false

    server.relenquishControl(
      function start(start) {
        started = true
        return http.createServer()
      }
    )

    server.start()
    expect(started).to.be.true
    server.stop()

    done()
  }
)
