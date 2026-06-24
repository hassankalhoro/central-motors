import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        suzuki: {
          red: "#E11622",
          "red-dk": "#B30F1A",
          dark: "#06245C", // navy
          darker: "#081B3E", // footer
          blue: "#1E55A8",
          accent: "#2E7BD6",
          sky: "#7FB0F0",
        },
        ink: { DEFAULT: "#11161F", soft: "#3A4458", muted: "#6B7587", faint: "#94A1B3" },
        paper: "#F4F6F9",
        line: "#E3E7ED",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(16,22,31,.06)",
        lift: "0 16px 36px rgba(6,36,92,.14)",
        liftlg: "0 18px 40px rgba(6,36,92,.16)",
        cta: "0 8px 24px rgba(225,22,34,.3)",
      },
      maxWidth: { site: "1240px" },
      keyframes: {
        fadeUp: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "none" } },
        riseUp: { "0%": { opacity: "0", transform: "translateY(18px)" }, "100%": { opacity: "1", transform: "none" } },
        glowPulse: { "0%,100%": { opacity: ".5" }, "50%": { opacity: ".85" } },
      },
      animation: {
        "fade-up": "fadeUp .6s cubic-bezier(.2,.7,.3,1) both",
        "rise-up": "riseUp .6s cubic-bezier(.2,.7,.3,1) both",
        glow: "glowPulse 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
