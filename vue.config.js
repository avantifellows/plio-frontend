module.exports = {
  publicPath: "",
  configureWebpack: {
    // lets debugger map the code within a compressed file back to its position in the original file
    devtool: "source-map",
  },
  transpileDependencies: [/@vue\/*/, "vue-router", "plyr"],
  chainWebpack(config) {
    // reference: https://medium.com/@aetherus.zhou/vue-cli-3-performance-optimization-55316dcd491c
    config.plugins.delete("prefetch");
  },
};
