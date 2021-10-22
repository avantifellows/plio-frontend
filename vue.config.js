module.exports = {
  publicPath: "",
  configureWebpack: {
    // lets debugger map the code within a compressed file back to its position in the original file
    devtool: "source-map",
  },
};
