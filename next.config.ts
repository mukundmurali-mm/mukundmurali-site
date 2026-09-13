import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/post.html',
        has: [{ type: 'query', key: 'id', value: '(?<slug>.*)' }],
        destination: '/blog/:slug',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
