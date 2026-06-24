/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        tertiary: "var(--color-tertiary)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        darkBg: "var(--bg-dark)",
        cardBg: "var(--bg-card)",
        surface: "var(--bg-surface)",
        brutalBorder: "var(--border-brutal)",
        textPrimary: "var(--text-primary)",
        textMuted: "var(--text-muted)",
      },
      fontFamily: {
        anton: ["Inter", "sans-serif"],
        space: ["Inter", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        premium: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
        soft: "0 4px 20px 0 rgba(0, 0, 0, 0.2)",
        brutalLime: "none",
        brutalPurple: "none",
        brutalCyan: "none",
        brutalWarning: "none",
        brutalDanger: "none",
        brutalGray: "none",
        glowLime: "none",
        glowPurple: "none",
        glowCyan: "none",
      },
      borderWidth: {
        3: "3px",
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
