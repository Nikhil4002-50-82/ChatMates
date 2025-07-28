/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        custom: [`Caveat`, `cursive`],
      },
      colors: {
        custom1: "#9B1C31", // define once here
        ...colors,
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
