/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
      {
        source: '/ws',
        destination: 'http://localhost:8080/ws',
      },
    ];
  },
};

module.exports = nextConfig;
