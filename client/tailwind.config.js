module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Times New Roman", "IBM Plex Sans", "sans-serif"],
      },
      keyframes: {
        bounceUpDown: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        typing: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        blink: {
          "0%, 50%": { borderColor: "transparent" },
          "51%, 100%": { borderColor: "black" },
        },
      },
      animation: {
        bounceUpDown: "bounceUpDown 2s ease-in-out infinite",
        typing: "typing 3s steps(30, end) forwards",
        blink: "blink 0.5s step-end infinite",
      },
    },
  },
  plugins: [],
};
