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

  // Security Headers (including HSTS) - Applies to all routes in production
  async headers() {
    return [
      {
        // Apply to all paths
        source: '/:path*',
        headers: [
          // HSTS: 1 year, subdomains, NO preload (unless submitted to hstspreload.org)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Additional security headers for better protection
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
          // Referrer policy for privacy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Force HTTPS redirects (for HTTP attempts) - Applies in production
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
        permanent: true, // 301 redirect
      },
    ];
  },

  // Optional: Ensure HTTPS in production builds (Render handles some, but this reinforces)
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
};

module.exports = nextConfig;