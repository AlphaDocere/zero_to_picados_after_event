process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow Vercel preview deployment to access dev resources
  allowedDevOrigins: [
    'vm-7feszmh7skg7rpv3h6qnbdch.vusercontent.net',
    'localhost',
    '127.0.0.1',
  ],
}

export default nextConfig
