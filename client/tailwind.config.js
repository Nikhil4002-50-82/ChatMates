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
        custom1: "#9B1C31",
        custom2:"#A47864",
        custom3:"#C4BAB3",
        ...colors,
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
