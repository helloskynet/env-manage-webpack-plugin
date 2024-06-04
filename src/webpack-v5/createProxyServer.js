const http = require("http");
const getPort = require("./getPort");
const { createProxyMiddleware } = require("http-proxy-middleware");

const getServer = (app, port) => {
  const server2 = http.createServer(app);
  return server2.listen(port, () => {
    console.log("Server 2 listening on port " + port);
  });
};

const createProxyServer = (app, envObj, options) => {
  return getPort(envObj.localPort).then((availablePort) => {
    const appServer = getServer(app, availablePort);
    appServer.port = availablePort;
    return appServer;
  });
};

module.exports = createProxyServer;
