module.exports = {
  purge: ["./public/index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: "#F78000",
        "primary-hover": "#db7506",
      },
      opacity: ["disabled"],
    },
    backgroundColor: (theme) => ({
      ...theme("colors"),
      "primary-button": "#F78000",
      "primary-button-hover": "#db7506",
      "delete-button": "#E80000",
    }),
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
