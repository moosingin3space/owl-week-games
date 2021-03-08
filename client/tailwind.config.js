module.exports = {
  purge: ["./src/**/*.js", "./src/**/*.jsx", "./src/**/*.ts", "./src/**/*.tsx"],
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
