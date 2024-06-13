[![npm][npm]][npm-url]
[![node][node]][node-url]
![npm](https://img.shields.io/npm/dw/env-manage-webpack-plugin.svg)

# env-manage-webpack-plugin

环境管理插件

当有多个开发环境需要联调时，每次切换开发环境都需要重启 `webpack` 而通过 `env-manage-webpack-plugin` 来代理这些需要转发的请求，环境切换时只需要重启代理的服务器而不是重启整个 webpack，还可以同时启动多个代理服务器链接多个环境。

## 安装 Install

安装 env-manage-webpack-plugin

`npm i -D env-manage-webpack-plugin`

或

`pnpm i -D env-manage-webpack-plugin`

## 使用 Usage

添加 webpack 插件

**webpack.config.js**

```js
const EnvManageWebpackPlugin = require("env-manage-webpack-plugin");
const path = require("path");

module.exports = {
  devServer: {
    proxy: [
      {
        context: ["/simple"],
        target: "http://localhost:3010",
        changeOrigin: true,
      },
      {
        context: ["/two"],
        target: "http://localhost:3099",
        changeOrigin: true,
      },
    ],
  },
  plugins: [
    // 添加插件
    new EnvManageWebpackPlugin({
      envConfigPath: path.resolve(__dirname, "./env.config.js"),
    }),
  ],
};
```

配置完成之后，使用 `webpack server` 启动，然后访问 `/webpack-env-manage`,即可查看环境管理页面。

env-manage-webpack-plugin 共有两个配置项

- `envConfigPath`： 用于指定配置文件的位置，默认使用项目目录下的 `env.config.js`；
- `basePath`： `env-manage-webpack-plugin` 服务前缀，默认 `/webpack-env-manage`,如果和`env-manage-webpack-plugin` 的服务路径出现冲突，可通过此配置调整；
- `fallbackTarget` 对于代理服务器来说，所有未配置的转发的请求，都会回退到这个服务器上，一般无需提供，默认即为 `webpack-dev-server` 启动的地址;
- `proxy` 未使用  `webpack-dev-server` 时，使用此选项设置转发配置


### env.config.js

```js
const getEnvConfig = () => {
  return {
    envList: [
      {
        name: "1号测试环境",
        localPort: "3001",
        fallbackTarget: "",
        target: {
          "http://localhost:3010": "http://localhost:3011",
          "http://localhost:3099": "http://localhost:3020",
        },
      },
      {
        name: "222号测试环境",
        target: "http://localhost:3012",
        localPort: "3002",
      },
      {
        name: "333号测试环境",
        target: "http://localhost:3013",
        localPort: "3003",
      },
    ],
  };
};

module.exports = getEnvConfig;

```

#### name String

环境名称用于展示

#### target Object|String

环境地址

- 类型为 `String` webpack 配置中的 `devServer.proxy` 中配置的所有代理都将会被转发到该地址；

- 类型为 `Object` 将根据配置进行转发

用于环境中多个 IP 情况。

例如，两个接口 `/simple` 和 `/two` 分别请求不同的 `http://localhost:3010` 和 `http://localhost:3099`，

```js
// webpack.config
......
    proxy: [
      {
        context: ["/simple"],
        target: "http://localhost:3010",
        changeOrigin: true,
      },
      {
        context: ["/two"],
        target: "http://localhost:3099",
        changeOrigin: true,
      },
    ],
......

```

第二个环境的，两个接口 `/simple` 和 `/two` 分别请求不同的 `http://localhost:3011` 和 `http://localhost:3020`，`env.config.js` 配置如下：

```js
// env.config.js
const getEnvConfig = () => {
  return {
    envList: [
      {
        name: "1号测试环境",
        localPort: "3001",
        target: {
          "http://localhost:3010": "http://localhost:3011",
          "http://localhost:3099": "http://localhost:3020",
        },
      },
    ],
  };
};

module.exports = getEnvConfig;
```

> `webpack.config.js` 中的 `devServer.proxy` 中的 `target` 的属性即为 `envList[].target` 对象的 `key`

#### router

路由配置，将会直接替换所有的 `proxy` 中的router配置

#### localPort

本地服务端口，未提供或者提供的端口被占用时，将会自动寻找可用端口.

#### index

首页地址 `{protocol}://{host}:{localPort}{index}`;

<img src='doc/env-manage-webpack-plugin.png'/>

[npm]: https://img.shields.io/npm/v/env-manage-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/env-manage-webpack-plugin
[node]: https://img.shields.io/node/v/env-manage-webpack-plugin.svg
[node-url]: https://nodejs.org
