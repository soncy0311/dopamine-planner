const shared = require('../../packages/config/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...shared,
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
};
