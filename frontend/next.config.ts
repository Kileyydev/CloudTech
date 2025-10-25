/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['microless.com', 'via.placeholder.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
