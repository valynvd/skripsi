/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        grayDisabled: {
          600: 'hsl(0, 0%, 58%)',
          500: 'hsl(0, 0%, 90%)',
          400: 'hsl(0, 0%, 95%)',
        },
        primary: {
          500: 'hsla(357, 85%, 44%, 1)',
          400: 'hsla(357, 85%, 52%, 1)',
        },
        secondary: {
          400: 'hsla(0, 0%, 13%, 1)',
        },
      },
      maxWidth: {
        xs: '512px',
        xxs: '448px',
        '3xs': '384px',
        '4xs': '322px',
      },
      screens: {
        xs: '512px',
        xxs: '448px',
        '3xs': '384px',
        '4xs': '322px',
      },
    },
  },
  plugins: [],
};
