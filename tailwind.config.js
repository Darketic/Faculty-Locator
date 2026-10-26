/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f0',
          100: '#ffe8dd',
          200: '#ffd3bd',
          300: '#ffb593',
          400: '#f98459',
          500: '#ea5826',
          600: '#c84b1a',
          700: '#a63914',
          800: '#842f15',
          900: '#6b2915',
        },
      },
    },
  },
  plugins: [],
};
