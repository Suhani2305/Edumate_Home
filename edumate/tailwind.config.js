/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        edublue: '#2563eb',
        darknavy: '#1e3a8a',
        accent: '#fbbf24',
      }
    },
  },
  plugins: [],
} 