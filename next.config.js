/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'access.redhat.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'qualitykiosk.com',
      },
      {
        protocol: 'https',
        hostname: 'www.staff-blog.faith-sol-tech.com',
      },
      {
        protocol: 'https',
        hostname: 'devio2023-media.developers.io',
      },
    ],
  },
  allowedDevOrigins: ['http://127.0.0.1:3200'],
};

module.exports = nextConfig;