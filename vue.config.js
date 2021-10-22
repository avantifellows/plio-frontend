const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  publicPath: "",
  chainWebpack(config) {
    // to enable compression of assets: https://web.dev/uses-text-compression/?utm_source=lighthouse&utm_medium=devtools
    config.plugin("CompressionPlugin").use(CompressionPlugin);
  },
  configureWebpack: {
    // lets debugger map the code within a compressed file back to its position in the original file
    devtool: "source-map",
  },
};
