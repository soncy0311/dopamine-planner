import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@todo-list/ui', '@todo-list/shared'],
};

export default nextConfig;
