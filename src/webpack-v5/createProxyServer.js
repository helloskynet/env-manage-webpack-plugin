const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const getProxyMiddlewares = require("./proxy");

/**
 * 生成 代理服务器
 * @param {*} envItem 环境信息
 * @param {*} devServerOptions webpack devServer 配置
 * @returns
 */
const createProxyServer = (envItem, devServerOptions) => {
  const app = express();

  const newProxy = devServerOptions.proxy.map((item) => {
    const target = envItem?.targetMap?.[item.target] ?? envItem.target
    return {
      ...item,
      target,
    };
  });

  const { httpProxies, webSocketProxies } = getProxyMiddlewares(newProxy);

  // 安装 代理中间件
  httpProxies.forEach((middleware) => {
    app.use(middleware);
  });

  // Proxy WebSocket without the initial http request
  // https://github.com/chimurai/http-proxy-middleware#external-websocket-upgrade
  /** @type {RequestHandler[]} */
  webSocketProxies.forEach((webSocketProxy) => {
    /** @type {import("http").Server} */
    app.on(
      "upgrade",
      /** @type {RequestHandler & { upgrade: NonNullable<RequestHandler["upgrade"]> }} */
      (webSocketProxy).upgrade
    );
  });

  // create the proxy
  const webpackProxy = createProxyMiddleware({
    target: `http://localhost:${devServerOptions.port}/`,
    changeOrigin: true,
  });

  // 除了代理的请求，其他请求全部请求 devServer
  app.use("**", webpackProxy);
  return app.listen(envItem.localPort);
};

module.exports = createProxyServer;
