import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { MARKETS, marketDuty } from '@/data/markets'
import { PageHead, Pill } from '@/components/site-shell'

export const Route = createFileRoute('/export-to/')({
  head: () => pageHead('/export-to', { title: 'Import from Bangladesh to your country — duty, shipping and suppliers | BengalExport', description: 'Country guides for importers in the UK, EU, USA, Canada, Australia, Japan, Singapore and Saudi Arabia: import duty on Bangladeshi goods, ports, sea transit times and what BengalExport handles for you.' }),
  component: Markets,
})

function Markets() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <PageHead eyebrow="Country guides · updated November 2026" title="Buying from Bangladesh for your country" lead="Pick your country to see the import duty on Bangladeshi goods, the ports and sea transit time, the documents we provide, and every product we can deliver to you." />
      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {MARKETS.map((k) => {
          const d = marketDuty(k)
          return (
            <li key={k.id}>
              <Link to="/export-to/$market" params={{ market: k.id }} className="flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-5 text-foreground no-underline transition hover:border-brand hover:shadow-md">
                <span className="flex items-center justify-between gap-2 text-lg font-semibold">{k.name}<ArrowRight className="size-4 text-brand" aria-hidden="true" /></span>
                <span><Pill tone={d.zero ? 'ok' : 'warn'}>{d.zero ? '0% import duty' : 'Duty applies'}</Pill></span>
                <span className="text-[14px] text-muted-foreground">Ports: {k.ports} · {k.transit}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
