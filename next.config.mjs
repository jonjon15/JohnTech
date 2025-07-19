/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@vercel/postgres'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'johntech.vercel.app'],
    },
  },
  env: {
    BLING_API_URL: process.env.BLING_API_URL,
    BLING_CLIENT_ID: process.env.BLING_CLIENT_ID,
    BLING_CLIENT_SECRET: process.env.BLING_CLIENT_SECRET,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
