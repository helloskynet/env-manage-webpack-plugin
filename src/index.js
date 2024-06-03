const createEnvManage = require("./inde/createEnvManage");
const setupMiddlewares = require("./webpack-v5/setupMiddlewares");
const path = require("path");
const pluginName = "EnvManageWebpackPlugin";

class EnvManageWebpackPlugin {
  static defaultOptions = {
    envConfigPath: path.resolve(process.cwd(), "./env.config.js"),
    basePath: "/webpack-env-manage",
    port: 3000,
    in: true,
  };

  constructor(options) {
    this.options = {
      ...EnvManageWebpackPlugin.defaultOptions,
      ...options,
    };
  }

  apply(compiler) {
    compiler.hooks.afterPlugins.tap(pluginName, (compiler) => {
      // if (this.in) {
      //   createEnvManage(this.options);
      //   return;
      // }
      const originSetupMiddlewares =
        compiler.options?.devServer?.setupMiddlewares;
      if (originSetupMiddlewares) {
        compiler.options.setupMiddlewares = (...param) => {
          param[0] = originSetupMiddlewares(...param);
          return setupMiddlewares(...param, this.options);
        };
      } else {
        if (!compiler.options.devServer) {
          compiler.options.devServer = {};
        }
        compiler.options.devServer.setupMiddlewares = (...param) => {
          return setupMiddlewares(...param, this.options);
        };
      }
    });
  }
}

module.exports = EnvManageWebpackPlugin;
