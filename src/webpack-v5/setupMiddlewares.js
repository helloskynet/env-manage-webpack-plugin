const path = require("path");
const createProxyServer = require("./createProxyServer");
const registerEnvManageRouter = require("./envManage");
const { createProxyMiddleware } = require("http-proxy-middleware");

const serverMap = new Map();

const routerMap = {};

/**
 * 设置中间件
 * @param {*} middlewares webpack 中间件
 * @param {*} devServer webpack devServer 实例
 * @param {*} configPath 插件配置
 * @returns
 */
const setupMiddlewares = (
  middlewares,
  devServer,
  pluginConfig,
  devServerProxy
) => {
  if (!devServer) {
    throw new Error("webpack-dev-server is not defined");
  }

  const { defaultServer } = pluginConfig;

  const proxyList = [];

  const routerM = {};
  devServerProxy.forEach((item) => {
    item.context.forEach((e) => {
      proxyList.push(e);
    });
  });

  registerEnvManageRouter(devServer.app, pluginConfig, proxyList);

  /**
   * @return {Boolean}
   */
  const filter = function (pathname, req) {
    const host = req.get("host");
    const originIp = `${req.protocol}://${host}`;

    if (originIp === defaultServer) {
      return false;
    }
    return true;
  };

  const apiProxy = createProxyMiddleware(filter, {
    target: defaultServer,
    changeOrigin: true,
    router: (req) => {
      const ol = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
      // if(ol === "http://localhost:3001/simple"){
      //   return "http://localhost:3020"
      // }
      if(ol === "http://localhost:3001/two"){
        return "http://localhost:3020"
      }
      return null;
    },
  });

  middlewares.unshift(apiProxy);

  return middlewares;
};

module.exports = setupMiddlewares;
