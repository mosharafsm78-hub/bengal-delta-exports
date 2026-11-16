import { createFileRoute } from '@tanstack/react-router'
import { pageHead } from '@/lib/head'
import { PHOTOS, SAMPLE } from '@/data/photos'
import { PageHead } from '@/components/site-shell'

export const Route = createFileRoute('/photo-credits')({
  head: () => pageHead('/photo-credits'),
  component: Credits,
})

function Credits() {
  const stock = Object.entries(PHOTOS).filter(([, p]) => p.license !== SAMPLE)
  const samples = Object.values(PHOTOS).filter((p) => p.license === SAMPLE).length
  return (
    <div className="mx-auto max-w-5xl px-4 pt-12">
      <PageHead
        eyebrow="Photo credits"
        title="About our product images"
        lead={`Our ${samples} catalogue images are sample images made by BengalExport with AI (Google Flow) in one consistent studio style. They show each product type, not a specific lot. Order a paid sample to see the real goods, and before every shipment we send photos and video of your actual order.`}
      />
      {stock.length > 0 && (
        <>
          <h2 className="mt-2 text-xl">Stock photographs</h2>
          <ul className="m-0 grid list-none gap-2 p-0 text-[15px]">
            {stock.map(([k, p]) => (
              <li key={k} className="flex flex-wrap gap-x-2 border-b border-border pb-2">
                <span className="font-semibold">{k.replace(/-/g, ' ')}</span>
                <span className="text-muted-foreground">by {p.credit || 'unknown author'} · {p.license} ·</span>
                <a href={p.page} target="_blank" rel="noopener noreferrer" className="text-brand">source</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
