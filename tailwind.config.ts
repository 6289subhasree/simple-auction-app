import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      colors: {
        bg: "#0D0D1A",
        surface: "#0F0F22",
        card: "#13132A",
        border: "#1E1C3A",
        purple: "#A855F7",
        "purple-dark": "#9333EA",
        "purple-dim": "#7B2FBE",
        muted: "#5A5880",
        faint: "#3A3870",
        soft: "#A78BDE",
        text: "#F0EEF8",
      },
      animation: {
        livepulse: "livepulse 1.2s ease-in-out infinite",
        spin: "spin 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
