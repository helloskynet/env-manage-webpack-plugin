const path = require("path");
const pluginName = "EnvManagePlugin";
const express = require("express");
const getPorts = require("./lib/getPorts");
const getMiddlewares = require("./lib/getMiddlewares");
const { createProxyMiddleware } = require("http-proxy-middleware");

class EnvManagePlugin {
  static defaultOptions = {
    envConfigPath: path.resolve(process.cwd(), "./env.config.js"),
    basePath: "/webpack-env-manage",
    port: 3000,
    fallbackTarget: "",
  };

  constructor(options) {
    this.options = {
      ...EnvManagePlugin.defaultOptions,
      ...options,
    };
    // 根据计算获得的配置
    this.interConfig = {};
    this.proxyServerMap = new Map();
    this.envConfigMap = new Map();
    this.getEnvPluginConfig();
  }

  /**
   * 获取插件的环境配置信息
   */
  getEnvPluginConfig() {
    this.envConfig = require(this.options.envConfigPath)();
    this.envConfig.envList.forEach((item, index) => {
      const key = `${index}`;
      item.key = key;
      this.envConfigMap.set(key, item);
    });
  }

  setupApp(app) {
    // 静态服务器，
    this.app = app || express();
  }

  /**
   * 设置 插件内部路由
   */
  setupBuiltInRoutes() {
    const { app } = this;
    const { basePath } = this.options;
    /**
     * 获取静态页面，环境列表页
     */
    app.get(`${basePath}/`, (request, response) => {
      response.sendFile(path.resolve(__dirname, "./static/index.html"));
    });

    /**
     * 获取环境列表
     */
    app.get(`${basePath}/api/getlist`, (request, response) => {
      const { protocol, hostname } = request;
      const ipAdress = `${protocol}://${hostname}`;
      this.envConfig.envList.forEach((item) => {
        item.protocol = item.protocol || protocol;
        item.indexPage = `${ipAdress}:${item?.localPort ?? "[auto]"}${
          item?.index ?? ""
        }`;
        item.fallbackTarget = this.fallbackTarget;
        item.status = this.proxyServerMap.has(item.key) ? "running" : "standby";
      });
      response.send(this.envConfig.envList);
    });

    /**
     * 启动环境
     */
    app.get(`${basePath}/api/server/start`, async (request, response) => {
      const key = request.query.key;
      if (this.proxyServerMap.has(key)) {
        response.send({
          code: "1",
          message: "环境已经启动",
        });
      } else {
        const envConfig = this.envConfigMap.get(key);
        const appServer = await this.getProxyServerSync(key);
        const inst = appServer.listen(appServer.port);
        this.proxyServerMap.set(key, inst);
        response.send({
          code: "0",
          message: "环境启动成功",
        });
      }
    });

    /**
     * 关闭环境
     */
    app.get(`${basePath}/api/server/stop`, (request, response) => {
      const key = request.query.key;
      if (this.proxyServerMap.has(key)) {
        const inst = this.proxyServerMap.get(key);
        inst.close();
        this.proxyServerMap.delete(key);
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
  }

  /**
   * 获取代理服务器
   * @returns
   */
  getProxyServerSync(key) {
    const proxyServer = express();
    const envObj = this.envConfigMap.get(key);
    return getPorts(parseInt(envObj.localPort, 10)).then((availablePort) => {
      proxyServer.port = availablePort;
      envObj.localPort = availablePort;

      const newProxyList = this.interConfig.proxy.map((proxyConfig) => {
        const temp = {};
        if (proxyConfig.target) {
          if (typeof envObj.target === "string") {
            temp.target = envObj.target;
          } else {
            temp.target =
              envObj?.target?.[proxyConfig.target] || this.fallbackTarget;
          }
        }
        if (proxyConfig.router && envObj.router) {
          temp.router = envObj.router;
        }
        return {
          ...proxyConfig,
          ...temp,
        };
      });
      const { middlewares } = getMiddlewares(newProxyList);
      middlewares.push(
        createProxyMiddleware({
          target: this.fallbackTarget,
          changeOrigin: true,
        })
      );

      middlewares.forEach((middleware) => {
        if (typeof middleware === "function") {
          /** @type {T} */
          (proxyServer).use(
            /** @type {NextHandleFunction | HandleFunction} */
            (middleware)
          );
        } else if (typeof middleware.path !== "undefined") {
          /** @type {T} */
          (proxyServer).use(
            middleware.path,
            /** @type {SimpleHandleFunction | NextHandleFunction} */
            (middleware.middleware)
          );
        } else {
          /** @type {T} */
          (proxyServer).use(middleware.middleware);
        }
      });
      return proxyServer;
    });
  }

  getProxy(devServer) {
    this.interConfig.proxy = (devServer.options?.proxy ?? []).map((item) => {
      return {
        ...item,
        logProvider: () => this.interConfig.logger,
      };
    });
  }

  init(devServer) {
    this.setupApp(devServer.app);
    this.getProxy(devServer);
    this.setupBuiltInRoutes();
  }

  apply(compiler) {
    this.interConfig.logger = compiler.getInfrastructureLogger("webpack-env-manage");
    compiler.hooks.afterPlugins.tap(pluginName, (compiler) => {
      let originSetupMiddlewares = (middlewares) => middlewares;
      originSetupMiddlewares =
        compiler.options?.devServer?.setupMiddlewares ?? originSetupMiddlewares;

      if (!compiler.options.devServer) {
        compiler.options.devServer = {};
      }
      compiler.options.devServer.setupMiddlewares = (
        middlewares,
        devServer
      ) => {
        this.fallbackTarget =
          this.options.fallbackTarget ||
          `http://localhost:${devServer.options.port}`;

        this.init(devServer);
        return originSetupMiddlewares(middlewares, devServer);
      };
    });
  }
}

module.exports = EnvManagePlugin;
