import type { Config } from 'tailwindcss';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharedPreset = require('../../packages/config/tailwind.config.js');

const config: Config = {
  presets: [sharedPreset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/core/src/**/*.{ts,tsx}',
  ],
};

export default config;
