/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#f3f4f6',
        'border-default': '#DBE2EF'
      },
      backgroundImage: {
        'gradient-border': 'linear-gradient(to right, #4F46E5, #06B6D4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      }
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.gradient-border-2': {
          'border': '2px solid transparent',
          'background-image': 'linear-gradient(white, white), linear-gradient(to right, #4F46E5, #06B6D4)',
          'background-origin': 'border-box',
          'background-clip': 'padding-box, border-box',
        },
        '.border-gradient-hover': {
          'border': '3px solid transparent',
          'background-image': 'linear-gradient(white, white), linear-gradient(130deg, #FFB433, #B4EBE6, #80CBC4)',
          'background-origin': 'border-box',
          'background-clip': 'padding-box, border-box',
        }
      })
    }
  ],
} 