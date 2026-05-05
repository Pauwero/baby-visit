import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4EEE2",
        "paper-dark": "#EBE2D0",
        cream: "#FAF6EC",
        ink: "#2A1F14",
        "ink-soft": "#5A4A38",
        "ink-faint": "#8A7A65",
        terracotta: "#B8624A",
        sage: "#6B7F5A",
        "border-soft": "#D6CFC2",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-public-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sharp: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
