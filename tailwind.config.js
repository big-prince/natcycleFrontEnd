/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#D3FF5D",
        },
        darkgreen: {
          DEFAULT: "#204C27",
        },
        bg: {
          DEFAULT: "#f3f4f6",
        },
        blue: {
          DEFAULT: "#C8ECEE",
        }
      }
    },
  },
  plugins: [],
}

