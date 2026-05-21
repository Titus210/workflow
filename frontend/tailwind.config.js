
export default {
  darkMode: 'selector',
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        page: 'var(--page)',
        'card-bg': 'var(--card-bg)',
        'border-color': 'var(--border-color)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
}
