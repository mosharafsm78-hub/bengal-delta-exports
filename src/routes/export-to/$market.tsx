import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { CATS, FAMILIES } from '@/data/catalog'
import { dutyLine, marketById, marketDuty } from '@/data/markets'
import { PAYMENT_HEADLINE } from '@/data/site'
import { PageHead, Pill, TrustRow, WhoDoesWhat } from '@/components/site-shell'
import { money } from '@/lib/slug'

export const Route = createFileRoute('/export-to/$market')({
  loader: ({ params }) => {
    const market = marketById(params.market)
    if (!market) throw notFound()
    return { market }
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(`/export-to/${loaderData.market.id}`, {
          title: `Import from Bangladesh to ${loaderData.market.name}: duty, shipping, products | BengalExport`,
          description: `For ${loaderData.market.buyer} importers: ${marketDuty(loaderData.market).zero ? '0% import duty on most Bangladeshi goods' : 'import duty on Bangladeshi goods explained'}, ${loaderData.market.transit} to ${loaderData.market.ports}, payment by LC at sight, factory checks and inspection included.`,
        })
      : pageHead('/export-to'),
  component: MarketPage,
})

function MarketPage() {
  const { market: k } = Route.useLoaderData()
  const d = marketDuty(k)
  const cats = CATS.filter((c) => k.cats.includes(c.id))
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-[13.5px] text-muted-foreground"><Link to="/export-to" className="text-muted-foreground no-underline hover:text-brand">Country guides</Link><span className="mx-1.5">/</span><span className="text-foreground">{k.name}</span></nav>
      <PageHead eyebrow={`For ${k.buyer} importers`} title={`Import from Bangladesh to ${k.name}`} lead={`BengalExport checks the factory, inspects your goods, handles export customs and ships them insured to ${k.ports}. Settlement by ${PAYMENT_HEADLINE}; your broker clears the goods at your port.`} />
      <div className="mb-10 grid gap-4 md:grid-cols-3">
        <Fact title="Import duty" value={<Pill tone={d.zero ? 'ok' : 'warn'}>{d.duty}</Pill>} text={d.scheme} />
        <Fact title="Sea transit from Bangladesh" value={<b>{k.transit}</b>} text={`Main ports: ${k.ports}. Air cargo from Dhaka takes 1–4 days for urgent or fresh goods.`} />
        <Fact title="Proof of origin we provide" value={<b>{d.proof}</b>} text="Sent with the shipping documents, so your broker can apply the preferential rate." />
      </div>
      <TrustRow className="mb-12 max-w-3xl" />
      {cats.map((c) => (
        <section key={c.id} className="mb-10">
          <h2 className="mb-1 text-2xl">{c.name} for {k.name}</h2>
          <p className="mt-0 mb-4 text-[15px] text-muted-foreground">{dutyLine(k, c.id)}</p>
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {FAMILIES.filter((f) => f.cat === c.id).map((f) => {
              const lo = Math.min(...f.styles.map((s) => s.p[0]))
              return (
                <li key={f.id}>
                  <Link to="/export-to/$market/$familyId" params={{ market: k.id, familyId: f.id }} className="flex h-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-foreground no-underline hover:border-brand">
                    <span><b className="block">{f.name}</b><span className="text-[13px] text-muted-foreground">from {money(lo)} / {f.styles[0].u ?? 'pc'} · MOQ {f.moq.split(' (')[0]}</span></span>
                    <ArrowRight className="size-4 flex-none text-brand" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      <section className="mb-10"><h2 className="mb-4 text-2xl">Who does what</h2><WhoDoesWhat /></section>
      <Link to="/quote" className="btn btn-primary">Request a quotation, CIF {k.ports.split(',')[0]} <ArrowRight className="size-4" aria-hidden="true" /></Link>
    </div>
  )
}

function Fact({ title, value, text }: { title: string; value: React.ReactNode; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">{title}</div>
      <div className="mt-2 text-[15px]">{value}</div>
      <p className="mt-2 mb-0 text-[14px] text-muted-foreground">{text}</p>
    </div>
  )
}
