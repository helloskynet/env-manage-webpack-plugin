const setupMiddlewares = require("./webpack-v5/setupMiddlewares");
const path = require("path");
const pluginName = "EnvManageWebpackPlugin";

class EnvManageWebpackPlugin {
  static defaultOptions = {
    envConfigPath: path.resolve(process.cwd(), "./env.config.js"),
    basePath: "/webpack-env-manage",
  };

  constructor(options) {
    this.options = {
      ...EnvManageWebpackPlugin.defaultOptions,
      ...options,
    };
  }

  apply(compiler) {
    compiler.hooks.afterPlugins.tap(pluginName, (compiler) => {
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
