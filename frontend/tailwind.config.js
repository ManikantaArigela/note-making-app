/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        focus: {
          bg: '#f4f5f0',
          card: '#ffffff',
          dark: '#1b3b2b',
          darkHover: '#132c1f',
          primary: '#2d5a43',
          sage: '#d6e2d5',
          sageLight: '#eef3ee',
          border: '#e2e5dc',
          textMuted: '#6b7280',
          textDark: '#1f2937',
        },
      },
    },
  },
  plugins: [],
};
