/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glassWhite: "rgba(255, 255, 255, 0.08)",
        glassBorder: "rgba(255, 255, 255, 0.15)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.2)",
        glowBlue: "0 0 10px rgba(59, 130, 246, 0.6)",
      },
      backgroundImage: {
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
      },
      keyframes: {
        blink: {
          "0%, 80%, 100%": { transform: "scale(0.8)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        "gradient-move": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        blink: "blink 1.4s infinite both",
        gradient: "gradient-move 5s ease infinite",
      },
    },
  },
  plugins: [],
}
