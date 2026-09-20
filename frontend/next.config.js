/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
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
    RAZORPAY_KEY_ID: 'rzp_live_TeEhKi4wCZxUnV',
    NEXT_PUBLIC_RAZORPAY_KEY_ID: 'rzp_live_TeEhKi4wCZxUnV',
  },
}

module.exports = nextConfig
