import { createFileRoute } from '@tanstack/react-router'
import { pageHead } from '@/lib/head'
import { PHOTOS } from '@/data/photos'
import { PageHead } from '@/components/site-shell'

export const Route = createFileRoute('/photo-credits')({
  head: () => pageHead('/photo-credits'),
  component: Credits,
})

function Credits() {
  const list = Object.entries(PHOTOS)
  return (
    <div className="mx-auto max-w-5xl px-4 pt-12">
      <PageHead eyebrow="Photo credits" title="Photographs and licences" lead="Product photos on this site come from Pexels under the Pexels License, which allows commercial use. They illustrate each product type; ask us for photos and videos of your actual order." />
      <ul className="m-0 grid list-none gap-2 p-0 text-[15px]">
        {list.map(([k, p]) => (
          <li key={k} className="flex flex-wrap gap-x-2 border-b border-border pb-2">
            <span className="font-semibold">{k.replace(/-/g, ' ')}</span>
            <span className="text-muted-foreground">by {p.credit || 'unknown author'} · {p.license} ·</span>
            <a href={p.page} target="_blank" rel="noopener noreferrer" className="text-brand">source</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
