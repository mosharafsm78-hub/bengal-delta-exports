import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { bindClicks, trackPage, watchSections } from '@/lib/track'
import { SiteFooter, SiteHeader, WhatsAppFab } from '@/components/site-shell'
import { SITE } from '@/data/site'
import '../styles.css'

const base = import.meta.env.BASE_URL

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#0b6b5c' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` },
      { rel: 'preconnect', href: 'https://images.pexels.com' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE.name,
          alternateName: 'Bengal Export',
          url: 'https://bengalexport.online/',
          logo: 'https://bengalexport.online/favicon.svg',
          description: 'Export house in Bangladesh with 10,000+ suppliers: garments, footwear, home textiles, jute, fresh produce, food and handicrafts. Compliance, quality control, logistics and export documents for importers worldwide.',
          areaServed: 'Worldwide',
          knowsAbout: ['Export from Bangladesh', 'Garment sourcing', 'Apparel buying house', 'Footwear export', 'Home textiles', 'Jute products', 'Letter of credit trade'],
          email: SITE.email,
          telephone: SITE.phone || undefined,
          address: { '@type': 'PostalAddress', addressCountry: 'BD' },
        }),
      },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
})

function RootLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const isAdmin = path.includes('/admin')
  useEffect(() => {
    if (isAdmin) return
    bindClicks()
    trackPage(path)
    watchSections(path)
  }, [path, isAdmin])
  if (isAdmin) return <Outlet />
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-[60vh]">
        <Outlet />
      </main>
      <SiteFooter />
      <WhatsAppFab />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
