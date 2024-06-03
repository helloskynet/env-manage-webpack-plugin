const path = require("path");
const createProxyServer = require("./createProxyServer");

const serverMap = new Map();

/**
 * 注册env manage 相关的服务
 * @param {*} devServerApp envMangeApp
 * @param {*} pluginConfig 插件配置
 */
const registerEnvManageRouter = (devServerApp, pluginConfig, static) => {
  const { envConfigPath, basePath } = pluginConfig;

  const envConfig = require(envConfigPath)();

  const { envList, proxy } = envConfig;
  envList
    .filter((item) => item.target)
    .map((item) => {
      item.proxy = item.proxy || proxy;
      item.key = `${item.target}-+-${item.localPort}`;
      return item;
    });

  /**
   * 获取静态页面，环境列表页
   */
  devServerApp.get(basePath + "/", (request, response) => {
    response.sendFile(path.resolve(__dirname, "../static/index.html"));
  });

  /**
   * 获取环境列表
   */
  devServerApp.get(basePath + "/api/getlist", (request, response) => {
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
  devServerApp.get(basePath + "/api/server/start", (request, response) => {
    const key = request.query.key;
    if (serverMap.has(key)) {
      response.send({
        code: "1",
        message: "环境已经启动",
      });
    } else {
      const envItem = envList.find((item) => item.key === key);
      const inst = createProxyServer(envItem, pluginConfig, static);
      inst
        .then((port) => {
          if (port != envItem.localPort) {
            envItem.localPort = port;
          }
        })
        .then(() => {
          response.send({
            code: "0",
            message: "环境启动成功",
          });
        });
      serverMap.set(key, inst);
    }
  });
  /**
   * 关闭环境
   */
  devServerApp.get(basePath + "/api/server/stop", (request, response) => {
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

  return devServerApp;
};

module.exports = registerEnvManageRouter;