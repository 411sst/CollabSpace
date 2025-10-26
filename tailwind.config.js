/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CollabSpace Custom Color Palette
        primary: {
          DEFAULT: '#ADEDFF', // Light cyan/blue - primary actions
          dark: '#7DD3F0',    // Darker shade for hover
          light: '#D6F6FF',   // Lighter shade for backgrounds
        },
        secondary: {
          DEFAULT: '#F7A1D3', // Pink - secondary actions
          dark: '#F078BD',    // Darker shade
          light: '#FBD0E9',   // Lighter shade
        },
        dark: {
          DEFAULT: '#1B0E1A', // Very dark purple - main dark background
          lighter: '#2D1F2B', // Slightly lighter for cards
          brown: '#291100',   // Dark brown - accent dark
          green: '#011502',   // Very dark green - deepest dark
        },
        accent: {
          brown: '#291100',   // Warm accent
          cyan: '#ADEDFF',    // Cool accent
          pink: '#F7A1D3',    // Playful accent
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
