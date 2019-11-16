var library = require("module-library")(require)

module.exports = library.using([
  "web-site",
  "browser-bridge",
  "web-element",
  "./hot-reload"],
  function(WebSite, BrowserBridge, element, hotReload) {

    var site = new WebSite()
    var baseBridge = new BrowserBridge()

    var watcher = hotReload("my-lil-site", site, __dirname, "my-lil-site.js")

    var page = element([
      element("h1", "Hello"),
      element("p", "This is an HTML page.",
      element("button", "Add more stuff here")),
    ])

    function myLilSite(addRoute, stop) {
      addRoute(
        "get",
        "/",
        function(request, response) {
          var bridge = baseBridge.forResponse(
            response)
          watcher.notifyBridge(bridge)
          bridge.send(
            page)
        })

      return stop}

    return myLilSite})
