import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        tooltipSlide: {
          "0%": { opacity: "0", transform: "translateX(150%)" },
          "5%": { opacity: "1", transform: "translateX(-15px)" },
          "8%": { opacity: "1", transform: "translateX(0)" },
          "92%": { opacity: "1", transform: "translateX(0)" },
          "95%": { opacity: "1", transform: "translateX(-15px)" },
          "100%": { opacity: "0", transform: "translateX(150%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;