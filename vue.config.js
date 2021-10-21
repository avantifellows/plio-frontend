const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  publicPath: "",
  chainWebpack(config) {
    // to enable compression of assets: https://web.dev/uses-text-compression/?utm_source=lighthouse&utm_medium=devtools
    config.plugin("CompressionPlugin").use(CompressionPlugin);
  },
};
