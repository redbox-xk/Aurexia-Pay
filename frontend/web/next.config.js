/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },

  // Transpile dependencies
  transpilePackages: [
    '@radix-ui/react-slot',
    '@radix-ui/react-switch',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-label',
    '@radix-ui/react-dialog',
    '@radix-ui/react-toast',
    '@radix-ui/react-alert-dialog',
  ],

  // SWR cache configuration
  swcMinify: true,

  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    resolveAlias: {
      '@/*': './*',
    },
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
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
        ],
      },
    ]
  },
}

module.exports = nextConfig
