import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2, Landmark, ShieldCheck, FileText, Printer } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { DOCUMENTS, LC_DOCS, LC_TERMS, PAYMENT_HEADLINE, PAYMENT_TERMS, STEPS } from '@/data/site'
import { DataTable, PageHead } from '@/components/site-shell'

export const Route = createFileRoute('/how-we-work')({
  head: () => pageHead('/how-we-work'),
  component: HowWeWork,
})

function HowWeWork() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <PageHead eyebrow="How to order and pay" title="From your first request to goods at your port" lead="Eight clear steps. You pay by a 100% Letter of Credit at sight through your own bank, so your money is released only when the goods have shipped as agreed." />

      <div className="mb-12 grid gap-5 rounded-lg border border-brand/25 bg-brand-soft p-7 md:grid-cols-[auto_1fr_auto] md:items-center">
        <Landmark className="size-10 text-brand" aria-hidden="true" />
        <div>
          <div className="eyebrow">Payment</div>
          <p className="m-0 mt-1 font-display text-2xl font-semibold">{PAYMENT_HEADLINE}</p>
          <p className="m-0 mt-1 text-[15px] text-muted-foreground">For every order, every product and every country. No advance transfers.</p>
        </div>
        <a href="#lc" className="btn btn-primary">What your LC should say</a>
      </div>

      <h2 className="mb-5 text-[clamp(1.6rem,3vw,2.1rem)]">The order journey</h2>
      <ol className="m-0 grid list-none gap-px overflow-hidden rounded-lg border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(([t, d, time], i) => (
          <li key={t} className={`p-6 ${i === 3 ? 'bg-brand-soft' : 'bg-card'}`}>
            <span className="num font-display text-3xl font-semibold text-jute">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-3 mb-0 text-[17px]">{t}</h3>
            <p className="mt-1 mb-0 text-[15px] text-muted-foreground">{d}</p>
            <span className="mt-3 block text-sm font-semibold text-brand">{time}</span>
          </li>
        ))}
      </ol>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-7">
          <h2 className="mt-0 mb-4 text-2xl">Payment terms</h2>
          <dl className="m-0 grid gap-4 text-[15px]">{PAYMENT_TERMS.map(([k, v]) => <div key={k}><dt className="font-semibold">{k}</dt><dd className="m-0 text-muted-foreground">{v}</dd></div>)}</dl>
          <p className="mt-5 mb-0 text-sm text-muted-foreground">All export proceeds are received through our authorised-dealer bank in Bangladesh, as Bangladesh Bank rules require.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-7">
          <h2 className="mt-0 mb-4 text-2xl">How the LC protects you</h2>
          <ul className="m-0 grid list-none gap-3 p-0 text-[15px]">
            {[[ShieldCheck, 'Your bank holds the money, not us. Nothing is paid before shipment.'], [FileText, 'Payment happens only against documents that match your LC: the Bill of Lading proves the goods were loaded, the certificates prove what they are.'], [CheckCircle2, 'You set the conditions: latest shipment date, inspection certificate, documents and quantities.'], [Landmark, 'International rules (UCP 600) apply, recognised by every major bank.']].map(([I, t]) => {
              const Icon = I as typeof ShieldCheck
              return <li key={t as string} className="flex gap-2.5"><Icon className="mt-0.5 size-4 flex-none text-ok" aria-hidden="true" />{t as string}</li>
            })}
          </ul>
        </div>
      </div>

      <section id="lc" className="mt-14 scroll-mt-28">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="m-0 text-[clamp(1.6rem,3vw,2.1rem)]">What your LC should say</h2>
            <p className="mt-2 mb-0 max-w-[70ch] text-muted-foreground">Give this checklist to your bank with our proforma invoice. The exact company name, address and bank SWIFT details are printed on the proforma.</p>
          </div>
          <button type="button" onClick={() => window.print()} className="btn btn-outline print:hidden"><Printer className="size-4" aria-hidden="true" /> Print checklist</button>
        </div>
        <DataTable cols={['LC field', 'What to write']} rows={LC_TERMS} />
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-7">
          <h2 className="mt-0 mb-4 text-2xl">Documents we present to the bank</h2>
          <ul className="m-0 grid list-none gap-2.5 p-0 text-[15px]">{LC_DOCS.map((d) => <li key={d} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 flex-none text-ok" aria-hidden="true" />{d}</li>)}</ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-7">
          <h2 className="mt-0 mb-4 text-2xl">Everything you receive</h2>
          <ul className="m-0 grid list-none gap-2.5 p-0 text-[15px]">{DOCUMENTS.map((d) => <li key={d} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 flex-none text-ok" aria-hidden="true" />{d}</li>)}</ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-lg bg-brand p-8 text-brand-ink md:flex-row md:items-center print:hidden">
        <div>
          <h2 className="m-0 text-[clamp(1.5rem,3vw,2rem)]">Step 1: request your proforma invoice</h2>
          <p className="mt-2 mb-0 opacity-85">It's free and carries no commitment until your LC is opened.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/products" className="btn border border-brand-ink/40 text-brand-ink">Browse products</Link>
          <Link to="/quote" className="btn bg-brand-ink text-brand">Request a proforma</Link>
        </div>
      </div>
    </div>
  )
}
