/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF3E6",
        blush: "#F4D6D0",
        rose: "#C9788A",
        burgundy: "#4A1424",
        gold: "#C9A24B",
        "dusk-plum": "#2B1233",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "serif"],
        body: ["'Lora'", "serif"],
        handwriting: ["'Caveat'", "cursive"],
        typewriter: ["'Special Elite'", "monospace"],
      },
      height: {
        screen: "100dvh",
      },
      minHeight: {
        screen: "100dvh",
      },
      padding: {
        safe: "env(safe-area-inset-bottom, 1rem)",
      },
    },
  },
  plugins: [],
};