const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    // colors: {
    //     ...colors,
    //     gray: {
    //         dark: '#d3d3d3'
    //     },
    // }
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
