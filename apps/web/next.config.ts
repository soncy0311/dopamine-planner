import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@todo-list/core', '@todo-list/ui', '@todo-list/shared'],
};

export default nextConfig;
