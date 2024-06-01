const path = require("path");
const createProxyServer = require("./createProxyServer");

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

  const { envConfigPath, basePath } = pluginConfig;

  const getEnvList = require(envConfigPath);

  const envList = getEnvList();
  
  /**
   * 获取静态页面，环境列表页
   */
  devServer.app.get(basePath + "/", (request, response) => {
    response.sendFile(path.resolve(__dirname, "../static/index.html"));
  });

  /**
   * 获取环境列表
   */
  devServer.app.get(basePath + "/api/getlist", (request, response) => {
    envList.forEach((item) => {
      item.key = `${item.targetIp}-+-${item.localPort}`;
      item.indexPage =
        item.indexPage || `http://${request.host}:${item.localPort}`;
      item.status = serverMap.has(item.key) ? "running" : "waitting";
    });
    response.send(envList);
  });

  /**
   * 启动环境
   */
  devServer.app.get(basePath + "/api/server/start", (request, response) => {
    const key = request.query.key;
    if (serverMap.has(key)) {
      response.send({
        code: "1",
        message: "环境已经启动",
      });
    } else {
      const envItem = envList.find((item) => item.key === key);
      const inst = createProxyServer(envItem, devServer.options);
      serverMap.set(key, inst);
      response.send({
        code: "0",
        message: "环境启动成功",
      });
    }
  });
  /**
   * 关闭环境
   */
  devServer.app.get(basePath + "/api/server/stop", (request, response) => {
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

  middlewares.unshift((res, req, next) => {
    console.log("webpack", res.header("referer"), res.header("header"));
    next();
  });

  return middlewares;
};

module.exports = setupMiddlewares;
