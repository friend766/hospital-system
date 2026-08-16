/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        navy: '#0F172A',
        lightBlue: '#EFF6FF',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        bg: '#F8FAFC',
        border: '#E2E8F0',
      },
      borderRadius: {
        DEFAULT: '12px',
        card: '12px',
        btn: '12px',
      },
    },
  },
  plugins: [],
};
