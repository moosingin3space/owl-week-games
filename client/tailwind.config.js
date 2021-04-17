module.exports = {
  purge: {
      content: ["./src/**/*.js", "./src/**/*.jsx", "./src/**/*.ts", "./src/**/*.tsx"],
      safelist: ['gatsby-focus-wrapper'],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    container: {
      center: true,
    }
  },
  variants: {
    extend: {
        backgroundColor: ['disabled'],
        cursor: ['hover'],
    },
  },
  plugins: [],
}
