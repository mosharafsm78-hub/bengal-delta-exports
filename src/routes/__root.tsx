import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
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
          description: 'Export trading house in Chattogram, Bangladesh: garments, footwear, home textiles, jute, fresh produce, food and handicrafts.',
          email: SITE.email,
          address: { '@type': 'PostalAddress', streetAddress: 'Jalalabad Co-operative Housing Society, West Khulshi', addressLocality: 'Chattogram', addressCountry: 'BD' },
        }),
      },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
})

function RootLayout() {
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
