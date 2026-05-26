import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Oswald'", "sans-serif"],
        body: ["'Rubik'", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
