const setupMiddlewares = require("./webpack-w/setupMiddlewares");
const path = require("path");
const pluginName = "EnvManagePlugin";

class EnvManagePlugin {
  static defaultOptions = {
    envConfigPath: path.resolve(process.cwd(), "./env.config.js"),
    basePath: "/env-manage",
    port: 3000,
    defaultServer: "http://localhost:8080",
  };

  constructor(options) {
    this.options = {
      ...EnvManagePlugin.defaultOptions,
      ...options,
    };
  }

  apply(compiler) {
    compiler.hooks.afterPlugins.tap(pluginName, (compiler) => {
      // if (this.in) {
      //   createEnvManage(this.options);
      //   return;
      // }
      const devServerProxy = compiler.options.devServer.proxy;
      const originSetupMiddlewares =
        compiler.options?.devServer?.setupMiddlewares;
      if (originSetupMiddlewares) {
        compiler.options.setupMiddlewares = (middlewares, devServer) => {
          param[0] = originSetupMiddlewares(middlewares, devServer);
          return setupMiddlewares(
            middlewares,
            devServer,
            this.options,
            devServerProxy
          );
        };
      } else {
        if (!compiler.options.devServer) {
          compiler.options.devServer = {};
        }
        compiler.options.devServer.setupMiddlewares = (
          middlewares,
          devServer
        ) => {
          return setupMiddlewares(
            middlewares,
            devServer,
            this.options,
            devServerProxy
          );
        };
      }
    });
  }
}

module.exports = EnvManagePlugin;
