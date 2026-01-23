import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#0a0a0a",
          text: "#00ff00",
          highlight: "#00ffff",
          warning: "#ffff00",
          error: "#ff0000",
        },
      },
      fontFamily: {
        mono: ["Courier New", "monospace"],
        retro: ['"Press Start 2P"', "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
