/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@vercel/postgres'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
  },
  env: {
    BLING_API_URL: process.env.BLING_API_URL || 'https://www.bling.com.br/Api/v3',
    BLING_CLIENT_ID: process.env.BLING_CLIENT_ID,
    BLING_CLIENT_SECRET: process.env.BLING_CLIENT_SECRET,
    BLING_ACCESS_TOKEN: process.env.BLING_ACCESS_TOKEN,
    BLING_WEBHOOK_SECRET: process.env.BLING_WEBHOOK_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
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
