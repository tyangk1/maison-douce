import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#FBF7F1",
        cream: "#F4EDE2",
        sand: "#E9DECF",
        espresso: "#231A12",
        bark: "#4A3826",
        cocoa: "#6B4F3A",
        caramel: "#B98A44",
        blush: "#C98D82",
        sage: "#7D8A70",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        display: ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        headline: ["clamp(1.4rem, 2.4vw, 2rem)", { lineHeight: "1.2" }],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(35, 26, 18, 0.08)",
        lift: "0 16px 48px rgba(35, 26, 18, 0.14)",
        card: "0 2px 12px rgba(35, 26, 18, 0.06)",
      },
      borderRadius: {
        card: "14px",
      },
      transitionTimingFunction: {
        elegant: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
