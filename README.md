A wrapper for Express that adds the things it boneheadedly leaves out by default:

```javascript
var Server = require("nrtv-server")

var instance = new Server()
instance.get("/", function(x,response) {
  response.send("okay")
})
instance.start(4100)
instance.stop()
```

Features

* Adds bodyParser
* Has a stop method. Yeah.