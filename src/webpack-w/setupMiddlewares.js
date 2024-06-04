const { createProxyMiddleware } = require("http-proxy-middleware");
const { getRouters, portToIpMap } = require("./router");
const micromatch = require("micromatch");

const setupMiddlewares = (middlewares, devServer, pluginConfig) => {
  const { basePath } = pluginConfig;

  devServer.app.use(basePath, getRouters(pluginConfig, devServer.app));

  const proxyList = [];
  devServer.options.proxy.map((proxyConfig) => {
    let context = proxyConfig.context || proxyConfig.path;

    if (typeof context === "function") {
      context = context();
    }

    if (typeof context === "string") {
      proxyList.push(context);
    } else if (typeof context === "object") {
      proxyList.push(...context);
    }
  });

  const filter = (pathname, req) => {
    const port = Number(req.get("host").split(":")[1]);
    if (port === Number(devServer.options.port)) {
      return false;
    }
    return true;
  };

  const proxyMiddlewares = createProxyMiddleware(filter, {
    target: "x",
    changeOrigin: true,
    router: (req) => {
      const port = Number(req.get("host").split(":")[1]);
      const envItem = portToIpMap.get(port);

      const needRouter = micromatch.isMatch(req.originalUrl, proxyList);

      if (needRouter) {
        return envItem.target;
      }

      return null;
    },
  });

  middlewares.unshift(proxyMiddlewares);

  return middlewares;
};

module.exports = setupMiddlewares;
