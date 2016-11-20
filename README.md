A wrapper for Express that adds the things it boneheadedly leaves out by default:

```javascript
var WebSite = require("web-site")

var instance = new WebSite()
instance.get("/", function(x,response) {
  response.send("okay")
})
instance.start(4100)
instance.stop()
```

Features

* Adds bodyParser
* Has a stop method. Yeah.