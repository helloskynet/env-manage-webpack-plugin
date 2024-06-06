const path = require("path");
const express = require("express");
const micromatch = require("micromatch");
const { createProxyMiddleware } = require("http-proxy-middleware");
const getEnvConfig = require("./getEnvConfig");
const getProxyServer = require("./getProxyServer");

const portToIpMap = new Map();
const serverMap = new Map();
const proxyList = [];
const proxyMap = new Map();

const router = express.Router();

const getEnvManagePlugin = (pluginConfig, devServer) => {
  const devServerApp = devServer.app;

  // 读取环境列表
  const envList = getEnvConfig(pluginConfig.envConfigPath);

  /**
   * 获取静态页面，环境列表页
   */
  router.get("/", (request, response) => {
    response.sendFile(path.resolve(__dirname, "../static/index.html"));
  });

  /**
   * 获取环境列表
   */
  router.get("/api/getlist", (request, response) => {
    const { protocol, hostname } = request;
    const ipAdress = `${protocol}://${hostname}`;
    envList.forEach((item) => {
      item.protocol = item.protocol || protocol;
      item.indexPage = `${ipAdress}:${item?.localPort ?? "[auto]"}${
        item?.index ?? ""
      }`;
      item.status = serverMap.has(item.key) ? "running" : "standby";
    });
    response.send(envList);
  });

  /**
   * 启动环境
   */
  router.get("/api/server/start", (request, response) => {
    const key = request.query.key;
    if (serverMap.has(key)) {
      response.send({
        code: "1",
        message: "环境已经启动",
      });
    } else {
      const envItem = envList.find((item) => item.key === key);
      const inst = getProxyServer(devServerApp, envItem, pluginConfig);
      inst
        .then((appServer) => {
          if (appServer.port != envItem.localPort) {
            envItem.localPort = appServer.port;
          }
          portToIpMap.set(appServer.port, envItem);
          appServer.envConfig = envItem;
          serverMap.set(key, appServer);
        })
        .then(() => {
          response.send({
            code: "0",
            message: "环境启动成功",
          });
        });
    }
  });
  /**
   * 关闭环境
   */
  router.get("/api/server/stop", (request, response) => {
    const key = request.query.key;
    if (serverMap.has(key)) {
      const inst = serverMap.get(key);
      const port = inst.port;
      portToIpMap.delete(port);
      inst.close();
      serverMap.delete(key);
      response.send({
        code: "0",
        message: "环境关闭成功",
      });
    } else {
      response.send({
        code: "1",
        message: "环境已经关闭",
      });
    }
  });

  devServer.options.proxy.forEach((proxyConfig) => {
    let context = proxyConfig.context || proxyConfig.path;

    if (typeof context === "function") {
      context = context(req);
    }


    if (typeof context === "string") {
      proxyList.push(context);
    } else if (typeof context === "object") {
      proxyList.push(...context);
    }
  });

  /**
   * dev-server 本身的port无需代理转发，只处理启动的环境
   * @param {*} pathname
   * @param {*} req
   * @returns
   */
  const filter = (pathname, req) => {
    const port = Number(req.get("host").split(":")[1]);
    if (port === Number(devServer.options.port)) {
      return false;
    }
    return true;
  };

  /**
   * 转发中间件，通过路由映射进行转发，每个端口启动一个环境，根据端口寻找对应的转发地址
   */
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

  return { router, proxyMiddlewares };
};

module.exports = getEnvManagePlugin;
