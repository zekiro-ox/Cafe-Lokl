/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brown: {
          50: "#F9F6F4",
          100: "#F2EAE5",
          200: "#E9D5C9",
          300: "#E0C0AD",
          400: "#D69A75",
          500: "#CC743D",
          600: "#B36636",
          700: "#7A4424",
          800: "#5C341C",
          900: "#3E2315",
          950: "#2B170F", // Added a much darker brown
        },
      },
    },
  },
  plugins: [],
};
