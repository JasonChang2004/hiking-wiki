module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 山林主題配色系統
        mountain: {
          50: '#f0fdf4',   // 晨光薄霧
          100: '#dcfce7',  // 春葉嫩綠
          200: '#bbf7d0',  // 森林清新
          300: '#86efac',  // 山林綠意
          400: '#4ade80',  // 生機盎然
          500: '#22c55e',  // 主要綠色
          600: '#16a34a',  // 深山翠綠
          700: '#15803d',  // 古木深綠
          800: '#166534',  // 深山墨綠
          900: '#14532d',  // 山林暗影
        },
        earth: {
          50: '#fef7ed',   // 晨曦金光
          100: '#fed7aa',  // 金桂花香
          200: '#fdba74',  // 楓葉橙黃
          300: '#fb923c',  // 夕陽橘紅
          400: '#f97316',  // 山峰夕照
          500: '#ea580c',  // 深山夕陽
          600: '#dc2626',  // 登山警示
          700: '#b91c1c',  // 危險警告
          800: '#991b1b',  // 深度警示
          900: '#7f1d1d',  // 極度警示
        },
        sky: {
          50: '#f0f9ff',   // 高山晨霧
          100: '#e0f2fe',  // 清晨天光
          200: '#bae6fd',  // 山間藍天
          300: '#7dd3fc',  // 晴空萬里
          400: '#38bdf8',  // 高山藍天
          500: '#0ea5e9',  // 主要藍色
          600: '#0284c7',  // 深邃藍天
          700: '#0369a1',  // 山嶺暮色
          800: '#075985',  // 深山夜空
          900: '#0c4a6e',  // 星空深藍
        },
        stone: {
          50: '#fafaf9',   // 雪白石面
          100: '#f5f5f4',  // 花崗岩白
          200: '#e7e5e4',  // 石階灰白
          300: '#d6d3d1',  // 山石淺灰
          400: '#a8a29e',  // 石徑灰色
          500: '#78716c',  // 岩石本色
          600: '#57534e',  // 深色岩石
          700: '#44403c',  // 山洞暗影
          800: '#292524',  // 深山巨石
          900: '#1c1917',  // 洞穴深黑
        },
        // 保持向後兼容
        'wiki-bg': '#f9fafb',
        'wiki-border-light': '#e5e7eb', 
        'wiki-link': '#0369a1',
        'wiki-bg-light': '#f3f4f6',
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif TC"', 'Georgia', 'serif'],
        display: ['"Source Han Sans TC"', '"Noto Sans TC"', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'mountain': '0 4px 6px -1px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06)',
        'earth': '0 4px 6px -1px rgba(249, 115, 22, 0.1), 0 2px 4px -1px rgba(249, 115, 22, 0.06)',
        'sky': '0 4px 6px -1px rgba(14, 165, 233, 0.1), 0 2px 4px -1px rgba(14, 165, 233, 0.06)',
        'nature': '0 10px 15px -3px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
