/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'pixel-teal': {
          DEFAULT: '#5ebdb2',
          dark: '#4a9d93',
          light: '#7fd4ca',
        },
        'pixel-green': {
          DEFAULT: '#7cc47f',
          dark: '#5eaa61',
          light: '#9edd9f',
        },
        'pixel-beige': {
          DEFAULT: '#e8dab2',
          dark: '#d6c89c',
          light: '#f5ecd4',
        },
        'pixel-blue': {
          DEFAULT: '#68b0d8',
          dark: '#4a99c7',
          light: '#8bc5e4',
        },
        'pixel-pink': {
          DEFAULT: '#f5b0bd',
          dark: '#e8899b',
          light: '#fccbd5',
        },
        'pixel-accent': '#68b0d8',
      },
      boxShadow: {
        'pixel': '4px 4px 0 rgba(0, 0, 0, 0.2)',
        'pixel-btn': '2px 2px 0 black',
        'pixel-btn-hover': '3px 3px 0 black',
        'pixel-btn-active': '1px 1px 0 black',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace', 'Arial', 'Helvetica', 'sans-serif'],
      },
      fontSize: {
        'pixel-sm': '0.75rem',
        'pixel-base': '0.85rem',
      },
      borderWidth: {
        'pixel': '2px',
      },
    },
  },
  plugins: [],
}
