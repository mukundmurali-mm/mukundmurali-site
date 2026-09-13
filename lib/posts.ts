import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type Post = {
  slug: string
  title: string
  date: string
  tags: string[]
  excerpt: string
  readTime: string
  cover: string
  content: string
}

const postsDirectory = path.join(process.cwd(), 'content/posts')

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return []
  const files = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.md'))

  const posts = files.map(filename => {
    const filePath = path.join(postsDirectory, filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    const slug = data.slug || filename.replace(/\.md$/, '')
    const date = data.datePublished || data.date || ''
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : String(date).split('T')[0]

    const tagsRaw = data.tags || []
    const tags: string[] = typeof tagsRaw === 'string'
      ? tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean)
      : Array.isArray(tagsRaw) ? tagsRaw.map(String) : []

    const excerpt = data.excerpt || data.brief || content.replace(/^#.*\n/gm, '').replace(/[*_#>\[\]!`]/g, '').trim().slice(0, 200) + '…'

    return {
      slug,
      title: data.title || slug,
      date: dateStr,
      tags,
      excerpt,
      readTime: estimateReadTime(content),
      cover: data.cover || data.coverImage || '/placeholder.svg?height=720&width=1280',
      content,
    }
  })

  return posts.sort((a, b) => (b.date > a.date ? 1 : -1))
}

// Keep backward-compatible exports
export const posts = getAllPosts()

export function getPost(slug: string): Post | undefined {
  return posts.find(post => post.slug === slug)
}

export function getLatestPosts(n = 3): Post[] {
  return posts.slice(0, n)
}

export function formatDate(date: string): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}
