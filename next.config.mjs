/** @type {import('next').NextConfig} */
const DJANGO_API_URL = process.env.DJANGO_API_URL || "http://127.0.0.1:8000"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  experimental: {
    turbo: {
      root: import.meta.dirname,
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*/",
        destination: `${DJANGO_API_URL}/api/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${DJANGO_API_URL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
