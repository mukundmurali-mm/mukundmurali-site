import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import { getPost, posts, formatDate } from '@/lib/posts'
import { PostContent } from './post-content'

export function generateStaticParams() {
  return posts.map(post => ({ slug: post.slug }))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <main>
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl justify-between px-5 py-4">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> All writing
          </Link>
          <Link href="/" className="font-mono text-xs text-muted-foreground">
            mukund.mm
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            {post.title}
          </h1>
          <div className="mt-7 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={13} /> {post.readTime}
            </span>
          </div>
        </div>

        {post.cover && !post.cover.includes('placeholder') && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="mt-14 max-w-3xl">
          <PostContent content={post.content} />
        </div>

        <div className="mt-20 border-t border-border pt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft size={14} /> Back to all posts
          </Link>
        </div>
      </article>
    </main>
  )
}
