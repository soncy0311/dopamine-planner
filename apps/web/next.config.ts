import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  transpilePackages: ['@todo-list/core', '@todo-list/ui', '@todo-list/shared'],
  images: { unoptimized: true },
};

export default nextConfig;
