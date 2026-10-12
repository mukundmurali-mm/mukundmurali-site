import type { MetadataRoute } from 'next'
import { posts } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mukundmurali.in'
  return [
    { url: base, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map(post => ({ url: `${base}/blog/${post.slug}`, changeFrequency: 'yearly' as const, priority: 0.6 })),
  ]
}
