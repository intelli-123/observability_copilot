/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ This line enables class-based dark mode
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a202c',  // Optional: used in dark mode
        foreground: '#e2e8f0',  // Optional: used in dark mode
      },
    },
  },
  plugins: [],
};
