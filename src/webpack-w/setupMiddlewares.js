const micromatch = require("micromatch");
const getEnvManagePlugin = require("./router");

const setupMiddlewares = (middlewares, devServer, pluginConfig) => {
  const { basePath } = pluginConfig;

  const { router, proxyMiddlewares } = getEnvManagePlugin(
    pluginConfig,
    devServer
  );

  devServer.app.use(basePath, router);

  middlewares.unshift(proxyMiddlewares);

  return middlewares;
};

module.exports = setupMiddlewares;
