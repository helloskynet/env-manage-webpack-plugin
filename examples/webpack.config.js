const HtmlWebpackPlugin = require("html-webpack-plugin");
const EnvManageWebpackPlugin = require("../src");
const path = require("path");

const proxy = [
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
];

module.exports = {
  mode: "development",
  entry: [path.resolve(__dirname, "./src/index.js")],
  devServer: {
    proxy,
  },
  plugins: [
    new EnvManageWebpackPlugin({
      envConfigPath: path.resolve(__dirname, "./env.config.js"),
      proxy,
    }),
    new HtmlWebpackPlugin(),
  ],
};
