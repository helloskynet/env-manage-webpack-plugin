const express = require("express");

const createServer = (port, second) => {
  const app = express();
  app.use((req, res, next) => {
    console.log(
      "test server" + port,
      req.header("referer"),
      req.header("host")
    );
    next();
  });

  app.get("/simple", (req, res) => {
    res.send({ message: "request: simple Hello World! from " + port });
  });
  if (second) {
    app.get("/two", (req, res) => {
      res.send({ message: "request: two Hello World! form " + port });
    });
  }

  app.get("/", (req, res) => {
    res.send("Hello World!" + port);
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

createServer(3010);
createServer(3011);
createServer(3012);
createServer(3020, true);
