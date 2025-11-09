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
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudtech-c4ft.onrender.com',
        pathname: '/media/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: true, // Optional: makes /product/1/ → /product/1/index.html

  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // HTTPS redirects
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://www.cloudtechstore.net/:path*',
        permanent: true,
      },
    ];
  },

  // ✅ Remove static export for dynamic pages
  // output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
};

export default nextConfig;
