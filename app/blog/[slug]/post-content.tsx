'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeRaw from 'rehype-raw'

function preprocessMarkdown(md: string): string {
  // Fix Hashnode image syntax: ![alt](url align="center") → ![alt](url)
  md = md.replace(/!\[([^\]]*)\]\(([^ )]+)\s+align="[^"]*"\)/g, '![$1]($2)')
  // Remove Obsidian internal image links
  md = md.replace(/!\[\[[^\]]*\]\]/g, '')
  // Remove Obsidian internal wikilinks (keep text)
  md = md.replace(/\[\[([^\]|]*?)(?:\|([^\]]*))?\]\]/g, (_, link, label) => label || link)
  return md
}

export function PostContent({ content, cover }: { content: string; cover?: string }) {
  let processed = preprocessMarkdown(content)

  // Remove the first image from markdown if it matches the cover image (avoid duplicate)
  if (cover && !cover.includes('placeholder')) {
    // Strip query params for comparison
    const coverBase = cover.split('?')[0]
    processed = processed.replace(
      /^(\s*(?:#[^\n]*\n\s*)?)?!\[[^\]]*\]\([^)]*\)\n?(?:\*[^\n]*\*\n?)?/m,
      (match) => {
        const matchBase = match.match(/\(([^?)]+)/)?.[1] || ''
        return matchBase === coverBase || cover.includes(matchBase) || matchBase.includes(coverBase)
          ? ''
          : match
      }
    )
  }

  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeRaw]}
        components={{
          h1: ({ children, ...props }) => (
            <h1 className="mt-12 mb-6 text-3xl font-bold tracking-tight text-foreground" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="mt-12 mb-4 text-2xl font-bold tracking-tight text-foreground border-b border-border pb-3"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="mt-6 mb-2 text-lg font-semibold text-foreground" {...props}>
              {children}
            </h4>
          ),
          p: ({ children, node, ...props }) => {
            // Check if the paragraph only contains an image — don't wrap in <p>
            const hasOnlyImage =
              node?.children?.length === 1 && node.children[0].type === 'element' && (node.children[0] as any).tagName === 'img'
            if (hasOnlyImage) return <>{children}</>
            return (
              <p className="my-5 text-base leading-8 text-muted-foreground" {...props}>
                {children}
              </p>
            )
          },
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-4 hover:text-primary/80"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <figure className="my-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || ''}
                className="w-full rounded-xl border border-border"
                loading="lazy"
                {...props}
              />
              {alt && (
                <figcaption className="mt-3 text-center text-xs text-muted-foreground">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="my-8 border-l-3 border-primary pl-6 text-base italic text-muted-foreground"
              {...props}
            >
              {children}
            </blockquote>
          ),
          ul: ({ children, ...props }) => (
            <ul className="my-5 ml-6 list-disc space-y-2 text-muted-foreground" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="my-5 ml-6 list-decimal space-y-2 text-muted-foreground" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-base leading-7" {...props}>
              {children}
            </li>
          ),
          code: ({ children, className, ...props }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code
                  className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-primary"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className={`${className} text-sm`} {...props}>
                {children}
              </code>
            )
          },
          pre: ({ children, ...props }) => (
            <pre
              className="my-8 overflow-x-auto rounded-xl border border-border bg-muted p-5 text-sm"
              {...props}
            >
              {children}
            </pre>
          ),
          hr: () => <hr className="my-10 border-border" />,
          table: ({ children, ...props }) => (
            <div className="my-8 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-muted text-foreground" {...props}>
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-3 text-left font-semibold" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border-t border-border px-4 py-3 text-muted-foreground" {...props}>
              {children}
            </td>
          ),
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-foreground" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-foreground/90" {...props}>
              {children}
            </em>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
