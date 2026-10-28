/** @type {import('tailwindcss').Config} */
// Preflight is off so Tailwind does not reset the site's existing styles. Colours come from the CSS variables (light and dark).
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: { extend: { colors: { bg: 'var(--bg)', surface: 'var(--surface)', ink: 'var(--ink)', mute: 'var(--mute)', line: 'var(--line)', tint: 'var(--tint)', tint2: 'var(--tint2)', accent: 'var(--accent)', 'accent-d': 'var(--accent-d)' } } },
  plugins: [],
}
