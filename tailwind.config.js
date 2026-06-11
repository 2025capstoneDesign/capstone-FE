/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 브랜드 색상 — 신규 코드에서는 hex 대신 이 토큰 사용 권장
        // 예: bg-primary, text-primary-dark, border-accent
        primary: {
          DEFAULT: '#5B7F7C', // 메인 버튼, 강조 텍스트
          dark: '#455E5C',    // hover, active 탭
          deep: '#2F5F5B',
        },
        accent: '#80CBC4',    // 활성 탭, 아이콘
        secondary: '#f3f4f6',
        highlight: '#FFB433', // 하이라이트(주황)
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