const shared = require('@todo-list/config/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...shared,
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
};
