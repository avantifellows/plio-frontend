const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: "#F78000",
        "primary-hover": "#db7506",
      },
    },
    backgroundColor: (theme) => ({
      ...theme("colors"),
      "primary-button": "#F78000",
      "primary-button-hover": "#db7506",
      "delete-button": "#E80000",
    }),
    screens: {
      xsm: "360px",
      "bp-500": "500px",
      ...defaultTheme.screens,
    },
  },
  variants: {
    extend: {
      // to use "disabled:opacity-50" with tailwind
      opacity: ["disabled"],
      pointerEvents: ["disabled"],
      cursor: ["disabled", "hover"],
      backgroundColor: ["active"],
      display: ["hover"],
    },
  },
  plugins: [],
};
