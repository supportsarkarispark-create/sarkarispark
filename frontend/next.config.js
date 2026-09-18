/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  },
}

module.exports = nextConfig
