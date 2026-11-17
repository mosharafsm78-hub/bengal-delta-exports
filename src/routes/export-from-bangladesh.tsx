import { createFileRoute, Link } from '@tanstack/react-router'
import { pageHead } from '@/lib/head'
import { CATS, FAMILIES } from '@/data/catalog'
import { DUTY, STEPS, PAYMENT_HEADLINE } from '@/data/site'
import { PageHead, DataTable } from '@/components/site-shell'

const TITLE = 'Export from Bangladesh: one export house for garments, footwear, textiles, jute and food'
const DESC = 'How to import from Bangladesh through one export house: 10,000+ suppliers, certified factories, own QC, 0% duty in the EU, UK, Canada and Australia, CIF to your port, 100% LC at sight.'

const QA: [string, string][] = [
  ['What can I import from Bangladesh?', 'Garments and knitwear, denim, footwear and leather goods, towels and bed linen, jute bags and jute decor, fresh vegetables and fruit, spices, rice, frozen fish and shrimp, and handicrafts. BengalExport supplies all of them through one contract.'],
  ['Is there import duty on goods from Bangladesh?', 'Bangladesh is a Least Developed Country, so most goods enter the EU, UK, Canada, Australia, China and Japan at 0% duty. The Gulf states charge 5% on most goods and the USA adds a 19% reciprocal tariff. Each market is listed in the table on this page.'],
  ['How do I pay a Bangladeshi exporter safely?', 'BengalExport works only with a 100% irrevocable Letter of Credit at sight. Your bank pays only against compliant shipping documents, so you never send money before the goods ship.'],
  ['Who checks quality before shipment?', 'Our own QC team inspects every order before it ships. You can also appoint a third-party inspector such as SGS, Intertek or Bureau Veritas.'],
  ['Which certifications do your factories hold?', 'Partner factories are certified to BSCI/amfori, WRAP, Sedex, OEKO-TEX, GOTS, ISO 9001, HACCP, ISO 22000, GlobalGAP and Halal. We match the factory to the certificates your market requires.'],
  ['How fast can I get a price and samples?', 'A proforma invoice with your price delivered to your port within 24 hours. Ready-style samples ship within 24 hours of payment, and the sample cost is credited on your first order.'],
]

export const Route = createFileRoute('/export-from-bangladesh')({
  head: () => ({
    ...pageHead('/export-from-bangladesh', { title: `${TITLE} | BengalExport`, description: DESC }),
    scripts: [{ type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: QA.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }) }],
  }),
  component: ExportGuide,
})

function ExportGuide() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 pb-6">
      <PageHead eyebrow="Export from Bangladesh" title={TITLE} lead="BengalExport is an export house in Bangladesh with 10,000+ onboarded suppliers. We take care of supplier choice, compliance, quality control, logistics and export documents, so you deal with one company and one contract." />

      <section className="mb-12">
        <h2 className="mb-4 text-[clamp(1.5rem,3vw,2rem)]">What we export from Bangladesh</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATS.map((c) => {
            const fams = FAMILIES.filter((f) => f.cat === c.id)
            return (
              <div key={c.id} className="rounded-lg border border-border bg-card p-5">
                <h3 className="m-0 text-[17px]">{c.name}</h3>
                <p className="mt-2 mb-3 text-[14.5px] text-muted-foreground">{c.blurb}</p>
                <ul className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0 text-[14px]">
                  {fams.map((f) => <li key={f.id}><Link to="/products/$familyId" params={{ familyId: f.id }} className="text-brand">{f.name}</Link></li>)}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-[clamp(1.5rem,3vw,2rem)]">Why buyers source from Bangladesh</h2>
        <ul className="m-0 grid gap-2 pl-5 text-[16px]">
          <li>One of the world's largest garment exporters, with deep capacity in knitwear, denim and home textiles.</li>
          <li>Duty-free access to most major markets under Least Developed Country rules.</li>
          <li>Certified factories for social and environmental audits: BSCI/amfori, WRAP, Sedex, OEKO-TEX, GOTS.</li>
          <li>The world's main source of jute, plus a large farm and food sector for fresh produce, rice, spices and seafood.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-[clamp(1.5rem,3vw,2rem)]">Import duty on goods from Bangladesh</h2>
        <DataTable cols={['Market', 'Duty', 'Scheme']} rows={DUTY.map((d) => [<b key="m">{d.short}</b>, d.duty, d.scheme])} />
        <p className="mt-3 text-[14px] text-muted-foreground">See every market and a landed-cost calculator on <Link to="/duty-free-markets" className="text-brand">duty-free markets</Link>.</p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-[clamp(1.5rem,3vw,2rem)]">How importing from Bangladesh works with us</h2>
        <ol className="m-0 grid gap-3 pl-5 text-[16px]">
          {STEPS.map(([t, d, time]) => <li key={t}><b>{t}</b> <span className="text-muted-foreground">({time})</span>: {d}</li>)}
        </ol>
        <p className="mt-4 text-[15px]">Payment: <b>{PAYMENT_HEADLINE}</b>. Details on <Link to="/how-we-work" className="text-brand">how we work</Link> and <Link to="/shipping" className="text-brand">shipping</Link>.</p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-[clamp(1.5rem,3vw,2rem)]">Questions importers ask</h2>
        <div className="grid gap-3">
          {QA.map(([q, a]) => (
            <details key={q} className="rounded-lg border border-border bg-card px-6 py-4">
              <summary className="cursor-pointer text-[16.5px] font-semibold">{q}</summary>
              <p className="mt-3 mb-0 text-[15px] text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="rounded-xl bg-[#0b2545] p-8 text-white">
        <h2 className="m-0 text-[clamp(1.4rem,3vw,1.9rem)] text-white">Send your requirement. Price to your port in 24 hours.</h2>
        <Link to="/quote" className="btn btn-primary mt-5 inline-flex">Request a quotation</Link>
      </div>
    </div>
  )
}
