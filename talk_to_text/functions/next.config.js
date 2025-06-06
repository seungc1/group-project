/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,   // ← 빌드할 때 ESLint 에러를 무시
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
      '@/functions': __dirname
    };
    return config;
  }
};

module.exports = nextConfig;
