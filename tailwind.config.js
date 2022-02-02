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
        brown: "#78350F",
        "dark-brown": "#4E342E",
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
        xsm: "0.6rem",
      },
      inset: {
        "1/6": "16.666667%",
        "1/12": "8.333333%",
        "1/20": "5%",
        "1/100": "1%",
      },
      spacing: {
        "10/100": "10%",
        "15/100": "15%",
        "20/100": "20%",
        "35/100": "35%",
      },
    },
    screens: {
      "bp-320": "320px",
      "bp-360": "360px",
      "bp-420": "420px",
      "bp-500": "500px",
      ...defaultTheme.screens,
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
