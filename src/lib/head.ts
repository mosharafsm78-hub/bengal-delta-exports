import siteMetadata from '../metadata.json'

type MetaKey = keyof typeof siteMetadata
const ORIGIN = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')

export function pageHead(path: string, override?: { title: string; description: string; image?: string }) {
  const m = override ?? (siteMetadata[path as MetaKey] ?? siteMetadata.default)
  const canonical = ORIGIN ? ORIGIN + (path === '/' ? '/' : path) : undefined
  const meta: Record<string, string>[] = [
    { title: m.title },
    { name: 'description', content: m.description },
    { property: 'og:title', content: m.title },
    { property: 'og:description', content: m.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'BengalExport' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
  if (override?.image) meta.push({ property: 'og:image', content: override.image })
  if (canonical) meta.push({ property: 'og:url', content: canonical })
  return { meta, links: canonical ? [{ rel: 'canonical', href: canonical }] : [] }
}
