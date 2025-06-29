/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#0078ff',
          dark: '#0057b8',
          background: "var(--primary-background)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          light: '#f8f9fa',
          DEFAULT: '#e9ecef',
          dark: '#dee2e6',
          background: "var(--secondary-background)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent-color)",
          foreground: "var(--accent-foreground)",
          light: "var(--accent-light)",
          dark: "var(--accent-dark)",
        },
        status: {
          active: "var(--status-active)",
          hold: "var(--status-hold)",
          complete: "var(--status-complete)",
          issue: "var(--status-issue)",
        },
        chart: {
          blue: "var(--chart-blue)",
          green: "var(--chart-green)",
          purple: "var(--chart-purple)",
          orange: "var(--chart-orange)",
        },
        border: {
          primary: "var(--border-primary)",
          secondary: "var(--border-secondary)",
          light: "var(--border-light)",
          dark: "var(--border-dark)",
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
        dmsans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        card: '0px 4px 20px rgba(237, 237, 237, 0.5)',
        nav: '0px 20px 50px rgba(55, 69, 87, 0.1)',
      },
      borderRadius: {
        card: '20px',
        metric: '16px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};