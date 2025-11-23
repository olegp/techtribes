/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#206bc4",
          hover: "#1e5ba8",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f3f4f6",
          hover: "#e5e7eb",
          foreground: "#1f2937",
        },
        background: "#ffffff",
        foreground: "#1f2937",
        muted: {
          DEFAULT: "#6b7280",
          foreground: "#4b5563",
        },
        border: "#e5e7eb",
        ring: "#206bc4",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
        xl: "1rem",
      },
    },
  },
  plugins: [],
}