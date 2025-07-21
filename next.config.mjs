/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@vercel/postgres'],
  experimental: {
    serverActions: {
      allowedOrigins: ['johntech.vercel.app'],
    },
  },
  env: {
    BLING_API_URL: process.env.BLING_API_URL,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
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
