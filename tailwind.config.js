export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 25px 60px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #4f46e5 0%, #22d3ee 100%)',
      },
    },
  },
  plugins: [],
};
