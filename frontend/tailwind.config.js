/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2fb",
          100: "#d7e0f5",
          500: "#1f3d8f",
          600: "#193274",
          700: "#142859",
        },
        teal: {
          600: "#0f6e56",
        },
      },
    },
  },
  plugins: [],
};
