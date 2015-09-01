var library = require("nrtv-library")(require)

library.test(
  "sending text",
  ["./server", "supertest"],
  function(expect, done, Server, request) {

    var instance = new Server()

    instance.get(
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


library.test(
  "getting a collective instance",
  ["./server", "supertest"],
  function(expect, done, Server, request) {

    Server.get(
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
