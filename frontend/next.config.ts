/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['microless.com', 'via.placeholder.com'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloudtech-c4ft.onrender.com',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;