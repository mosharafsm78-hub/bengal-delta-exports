import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { DOCUMENTS, PAYMENT_TERMS, STEPS } from '@/data/site'
import { PageHead } from '@/components/site-shell'

export const Route = createFileRoute('/how-we-work')({
  head: () => pageHead('/how-we-work'),
  component: HowWeWork,
})

function HowWeWork() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <PageHead eyebrow="How to order" title="From your inquiry to your warehouse" lead="Eight steps, each with a named document or check, so you always know where your order stands." />
      <ol className="m-0 grid list-none gap-px overflow-hidden rounded-lg border border-border bg-border p-0 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(([t, d, time], i) => (
          <li key={t} className="bg-card p-6">
            <span className="num font-display text-3xl font-semibold text-jute">{String(i + 1).padStart(2, '0')}</span>
            <h2 className="mt-3 mb-0 font-sans text-[17px] font-semibold tracking-normal">{t}</h2>
            <p className="mt-1 mb-0 text-[15px] text-muted-foreground">{d}</p>
            <span className="mt-3 block text-sm font-semibold text-brand">{time}</span>
          </li>
        ))}
      </ol>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-7">
          <h2 className="mt-0 mb-4 text-2xl">Payment terms</h2>
          <dl className="m-0 grid gap-4 text-[15px]">{PAYMENT_TERMS.map(([k, v]) => <div key={k}><dt className="font-semibold">{k}</dt><dd className="m-0 text-muted-foreground">{v}</dd></div>)}</dl>
          <p className="mt-5 mb-0 text-sm text-muted-foreground">All export proceeds are received through our authorised-dealer bank in Bangladesh, as Bangladesh Bank rules require.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-7">
          <h2 className="mt-0 mb-4 text-2xl">Documents you receive</h2>
          <ul className="m-0 grid list-none gap-2.5 p-0 text-[15px]">{DOCUMENTS.map((d) => <li key={d} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 flex-none text-ok" aria-hidden="true" />{d}</li>)}</ul>
        </div>
      </div>
      <div className="mt-10"><Link to="/quote" className="btn btn-primary">Start with a quote request</Link></div>
    </div>
  )
}
