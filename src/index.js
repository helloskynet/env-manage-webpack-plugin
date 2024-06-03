const setupMiddlewares = require("./webpack-v5/setupMiddlewares");
const path = require("path");
const pluginName = "EnvManageWebpackPlugin";

class EnvManageWebpackPlugin {
  static defaultOptions = {
    envConfigPath: path.resolve(process.cwd(), "./env.config.js"),
    basePath: "/webpack-env-manage",
    open: true,
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

      const getOpen = (open) => {
        if (typeof devServerOpen === "array") {
          return open.push(this.options.basePath);
        }
        return [this.options.basePath];
      };

      const devServerOpen = compiler.options?.devServer?.open;
      if (this.options.open) {
        if (typeof devServerOpen === "object") {
          compiler.options.devServer.open.target = getOpen(
            compiler.options.devServer.open.target
          );
        } else {
          compiler.options.devServer.open = getOpen(
            compiler.options.devServer.open
          );
        }
      }
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
