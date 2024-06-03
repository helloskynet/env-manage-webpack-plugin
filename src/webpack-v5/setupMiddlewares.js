const path = require("path");
const createProxyServer = require("./createProxyServer");
const registerEnvManageRouter = require("../inde/envManageRouter");

const serverMap = new Map();

/**
 * 设置中间件
 * @param {*} middlewares webpack 中间件
 * @param {*} devServer webpack devServer 实例
 * @param {*} configPath 插件配置
 * @returns
 */
const setupMiddlewares = (middlewares, devServer, pluginConfig) => {
  if (!devServer) {
    throw new Error("webpack-dev-server is not defined");
  }

  const targetMap = {};
  devServer.options.proxy.map((item) => {
    targetMap[item.context.toString()] = item.target;
  });

  registerEnvManageRouter(devServer.app, pluginConfig, {
    target: `http://127.0.0.1:${devServer.options.port}`,
    context: "**",
  });

  return middlewares;
};

module.exports = setupMiddlewares;
