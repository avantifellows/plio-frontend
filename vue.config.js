module.exports = {
  publicPath: "/",
  configureWebpack: {
    // lets debugger map the code within a compressed file back to its position in the original file
    devtool: "source-map",
  },
  transpileDependencies: [
    /@vue\/*/,
    "vue-router",
    "plyr",
    "primevue",
    "vue-i18n",
    "vue-toastification",
  ],
  chainWebpack(config) {
    // reference: https://github.com/vuejs/vue-cli/issues/979#issuecomment-372990631
    config.plugins.delete("prefetch");
  },
};
