/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
