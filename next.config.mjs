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
    'vm-7kzva3c7mnjspirnsn6dpzu0.vusercontent.net',
    'localhost',
    '127.0.0.1',
  ],
}

export default nextConfig
