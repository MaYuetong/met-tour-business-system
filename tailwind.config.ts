import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        met: {
          red:      "#A6192E",
          "red-dark": "#8B1525",
          bg:       "#F8F5F0",
          text:     "#1A1A1A",
          gold:     "#C9A84C",
          border:   "#E0D5C8",
          muted:    "#8B7D72",
          "bg-dark": "#EDE8E0",
          dark:     "#111111",
        },
      },
      fontFamily: {
        noto:      ["var(--font-noto)", "Noto Serif SC", "Songti SC", "STSong", "SimSun", "serif"],
        "sans-ui": ["var(--font-sans)", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "sans-serif"],
        // legacy aliases kept for admin pages
        playfair:  ["var(--font-noto)", "Noto Serif SC", "Songti SC", "STSong", "SimSun", "serif"],
        garamond:  ["var(--font-noto)", "Noto Serif SC", "Songti SC", "STSong", "SimSun", "serif"],
      },
      animation: {
        "fade-in":  "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "marquee":  "marquee 40s linear infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
    },
  },
  plugins: [],
};
export default config;
