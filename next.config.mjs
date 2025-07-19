/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@vercel/postgres'],
  },
  
  // Otimizações para performance
  compress: true,
  poweredByHeader: false,
  
  // Headers de segurança e performance
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },

  // Configurações de timeout
  serverRuntimeConfig: {
    maxDuration: 10, // 10 segundos máximo
  },

  // Otimizações de build
  swcMinify: true,
  
  // Configurações de imagem
  images: {
    domains: ['blob.v0.dev'],
    formats: ['image/webp', 'image/avif'],
    unoptimized: true,
  },

  // Configurações de webpack para otimização
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
