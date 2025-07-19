/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['crypto', 'fs', 'path'],
  env: {
    BLING_CLIENT_ID: process.env.BLING_CLIENT_ID,
    BLING_CLIENT_SECRET: process.env.BLING_CLIENT_SECRET,
    BLING_WEBHOOK_SECRET: process.env.BLING_WEBHOOK_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
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
