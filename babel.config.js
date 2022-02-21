module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  env: {
    production: {
      plugins: [],
    },
    development: {
      plugins: [
        [
          "babel-plugin-istanbul",
          {
            extension: [".js", ".vue"],
          },
        ],
      ],
    },
  },
};
