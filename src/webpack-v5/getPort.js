const getPorts = require("webpack-dev-server/lib/getPort");

const defaultPort = 3000;

const getPort = (port) => {
  let basePort = Number(port);

  let updateDefault = false;
  if (isNaN(basePort)) {
    basePort = defaultPort;
    updateDefault = true;
  }

  return getPorts(basePort).then((availablePort) => {
    if (updateDefault) {
      defaultPort = availablePort + 1;
    }
    return availablePort;
  });
};

module.exports = getPort;
