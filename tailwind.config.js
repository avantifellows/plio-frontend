const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: "#F78000",
        "primary-hover": "#db7506",
        peach: "#F4EAE1",
        "peach-light": "#FFF6EF",
      },
      backgroundImage: (theme) => ({
        "selectbox-arrow": "url('assets/images/chevron-down-solid-white.svg')",
      }),
      backgroundPosition: {
        "right-10%": "center right 10%",
      },
      backgroundSize: {
        "10%": "10%",
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
      "bp-420": "420px",
      "bp-500": "500px",
      ...defaultTheme.screens,
    },
    fontSize: {
      xsm: "0.6rem",
      ...defaultTheme.fontSize,
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
      strokeWidth: ["hover", "focus"],
    },
  },
  plugins: [],
};
