const http = require("http");
const getPorts = require("../lib/getPorts");

const getProxyServer = (app, envObj) => {
  return getPorts(envObj.localPort).then((availablePort) => {
    const server2 = http.createServer(app);
    server2.listen(availablePort);
    server2.port = availablePort;
    return server2;
  });
};

module.exports = getProxyServer;
