/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
  extend: {
  colors: {
    primary: "rgb(var(--color-primary) / <alpha-value>)",
    accent: "rgb(var(--color-accent) / <alpha-value>)",
    bgStart: "rgb(var(--color-bg-start) / <alpha-value>)",
    bgEnd: "rgb(var(--color-bg-end) / <alpha-value>)",
    textMain: "rgb(var(--text-main) / <alpha-value>)",
    textMuted: "rgb(var(--text-muted) / <alpha-value>)",
    glass: "rgb(var(--glass-bg) / var(--glass-opacity))",
    glassBorder: "rgb(var(--glass-border) / 0.2)",
  },
},
},
  plugins: [],
}