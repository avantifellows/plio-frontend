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
        "peach-hover": "#FFE0B2",
      },
      backgroundImage: () => ({
        "selectbox-arrow": "url('assets/images/chevron-down-solid-white.svg')",
      }),
      backgroundPosition: {
        "right-10%": "center right 10%",
      },
      backgroundSize: {
        "10%": "10%",
      },
      fontSize: {
        xxs: ".6rem",
      },
    },
    backgroundColor: (theme) => ({
      ...theme("colors"),
      "primary-button": "#F78000",
      "primary-button-hover": "#db7506",
      "delete-button": "#E80000",
    }),
    screens: {
      "bp-320": "320px",
      "bp-360": "360px",
      "bp-420": "420px",
      "bp-500": "500px",
      ...defaultTheme.screens,
    },
    fontSize: {
      xsm: "0.6rem",
      ...defaultTheme.fontSize,
    },
  },
  variantOrder: [
    "first",
    "last",
    "odd",
    "even",
    "visited",
    "checked",
    "group-hover",
    "group-focus",
    "focus-within",
    "hover",
    "focus",
    "focus-visible",
    "active",
    "group-disabled", // Custom variant
    "disabled",
  ],
  variants: {
    extend: {
      // to use "disabled:opacity-50" with tailwind
      opacity: ["disabled"],
      pointerEvents: ["disabled"],
      cursor: ["disabled", "hover"],
      textColor: ["group-disabled"],
      backgroundColor: ["active", "checked", "disabled"],
      borderColor: ["checked"],
      display: ["hover"],
      strokeWidth: ["hover", "focus"],
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-interaction-variants"),
  ],
};
