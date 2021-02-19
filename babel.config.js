//You will require babel plugin to remove the console.log from production build.
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  "env": {
    "production": {
        "plugins": ["transform-remove-console"]
    }
  }
}

