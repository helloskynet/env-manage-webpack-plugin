const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const getPort = require("../webpack-v5/getPort");

const createProxyServer = (envObj, options, static) => {
  const app = express();

  const proxy = [...(envObj.proxy || options.proxy)];

  proxy.push(static);

  proxy.forEach((item) => {
    app.use(createProxyMiddleware(item.context, { ...item, logger: console }));
  });

  return getPort(options.port).then((availablePort) => {
    app.listen(availablePort);
    return availablePort;
  });
};

module.exports = createProxyServer;
