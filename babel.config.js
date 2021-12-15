module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  env: {
    production: {
      plugins: ["transform-remove-console"],
    },
  },
  env: {
    development: {
      plugins: ["istanbul"],
    },
  },
};
