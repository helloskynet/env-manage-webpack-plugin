const http = require("http");
const getPort = require("../webpack-v5/getPort");

const getProxyServer = (app, envObj) => {
  return getPort(envObj.localPort).then((availablePort) => {
    const server2 = http.createServer(app);
    server2.listen(availablePort);
    server2.port = availablePort;
    return server2;
  });
};

module.exports = getProxyServer;
