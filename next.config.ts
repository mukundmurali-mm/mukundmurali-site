import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    // Old blog ID → new slug mapping (where they differ)
    const oldToNew: Record<string, string> = {
      'agi-era-compute-buildout': 'agi-era-compute-buildout-infrastructure-bottleneck-frontier-ai',
      'context-engineering': 'context-engineering-the-skill-that-separates-good-ai-users-from-great-ones',
      'cmozf79rr000202l5ehqs8i3x': 'interfacing-ai-mcp-vs-cli',
      'cmo5izw8w000502jv58mtadzc': 'building-a-second-brain-with-claude-obsidian',
      'cmnviupq7005u1qn5aqp2eo92': 'how-to-build-a-private-agentic-workflow-with-claude-code-and-ollama',
      'cmanf079g000109lc4mp132x7': 'build-a-no-code-ocr-app-using-oci-generative-ai-and-streamlit',
      'cm8vq3lla000109i3532m9auw': 'unlocking-ai-potential-the-model-context-protocol-mcp-revolution',
      'cm7uhjuzw000508l50hx25ze7': 'how-to-create-a-smart-research-assistant-using-oci-ai-agents',
      'cm3b1ammt000b09lg03tnbder': 'exploring-your-cloud-with-steampipe-and-powerpipe-an-overview-with-oci-focus',
      'cm310q6ai000308k1g8j91cay': 'googles-notebooklm-a-second-brain-for-the-ai-age',
      'clrxhf6qk000009l75y8faptx': 'inbound-nat-with-palo-alto-in-oci',
      'clrmzabsk00010al5g9071pq8': 'prompt-engineering-101-getting-started',
    }

    const postRedirects = Object.entries(oldToNew).map(([oldId, newSlug]) => ({
      source: `/blog/${oldId}`,
      destination: `/blog/${newSlug}`,
      permanent: true,
    }))

    return [
      // blogs.mukundmurali.in → mukundmurali.in/blog (host-level redirect)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'blogs.mukundmurali.in' }],
        destination: 'https://mukundmurali.in/blog/:path*',
        permanent: true,
      },
      // Old format: post.html?id=slug → /blog/slug
      {
        source: '/post.html',
        has: [{ type: 'query', key: 'id', value: '(?<slug>.*)' }],
        destination: '/blog/:slug',
        permanent: true,
      },
      // Old slug redirects to new slugs
      ...postRedirects,
    ]
  },
}

export default nextConfig
