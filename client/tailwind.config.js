/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        custom: [`Caveat`, `cursive`],
      },
      backgroundColor: {
        custom1: "#9B1C31",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
