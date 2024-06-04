const path = require("path");
const express = require("express");
const getEnvConfig = require("./getEnvConfig");
const getProxyServer = require("./getProxyServer");

const portToIpMap = new Map();
const serverMap = new Map();

const getRouters = (pluginConfig, devServerApp) => {
  const envManageRouter = express.Router();

  // 读取环境列表
  const envList = getEnvConfig(pluginConfig.envConfigPath);

  /**
   * 获取静态页面，环境列表页
   */
  envManageRouter.get("/", (request, response) => {
    response.sendFile(path.resolve(__dirname, "../static/index.html"));
  });

  /**
   * 获取环境列表
   */
  envManageRouter.get("/api/getlist", (request, response) => {
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
  envManageRouter.get("/api/server/start", (request, response) => {
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
  envManageRouter.get("/api/server/stop", (request, response) => {
    const key = request.query.key;
    if (serverMap.has(key)) {
      const inst = serverMap.get(key);
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

  return envManageRouter;
};
module.exports = { getRouters, portToIpMap };
