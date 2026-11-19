import { Link } from '@tanstack/react-router'
import { ArrowRight, BadgeCheck, ClipboardCheck, PackageCheck, Receipt, Ruler, Truck } from 'lucide-react'

const POINTS = [
  [PackageCheck, 'Samples first, no risk', 'Order a few samples before any bulk commitment. Ready styles ship within 24 hours, and the sample cost is credited on your first order.'],
  [Ruler, 'Samples match your specification', 'We work to your fabric, weight, size chart and packing details, so what you approve at sample stage is what you receive in bulk.'],
  [Truck, 'Dispatched on time', 'We confirm a dispatch date before you pay and keep to it. Progress photos are shared at every stage.'],
  [ClipboardCheck, 'Inspected before it leaves', 'Our own QC team checks materials, production and finished cartons before loading, for samples and bulk alike.'],
  [Receipt, 'Clear, honest pricing', 'One quotation priced to your port, with every cost written in it, including sample courier. No surprises on the invoice.'],
  [BadgeCheck, 'Small orders, full attention', 'First-time importer or a small trial order, you get the same named account manager and the same care as a container buyer.'],
] as const

/** "Why buyers trust us": our own commitments (not customer quotes). Full on the homepage, compact on product pages. */
export function TrustPoints({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="eyebrow m-0 mb-1">Start small, check everything</p>
            <h2 className="m-0 text-[clamp(1.4rem,2.6vw,1.8rem)]">Why buyers trust us</h2>
          </div>
          <Link to="/quote" className="btn btn-primary self-start px-5 py-2.5">Request samples <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map(([Icon, t, d]) => (
            <li key={t} className="flex gap-3">
              <Icon className="mt-0.5 size-5 flex-none text-brand" aria-hidden="true" />
              <div><div className="text-[15px] font-semibold">{t}</div><div className="mt-0.5 text-[13.5px] text-muted-foreground">{d}</div></div>
            </li>
          ))}
        </ul>
      </section>
    )
  }
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow m-0 mb-2">Start small, check everything</p>
        <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">Why buyers trust us</h2>
        <p className="mt-3 mb-0 text-[17px] text-muted-foreground">Most of our buyers began with a few samples. These are the commitments that turned a sample order into regular business.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {POINTS.map(([Icon, t, d]) => (
          <div key={t} className="rounded-xl border border-border bg-card p-6">
            <Icon className="size-6 text-brand" aria-hidden="true" />
            <h3 className="mt-3 mb-2 text-[18px]">{t}</h3>
            <p className="m-0 text-[14.5px] text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
      <Link to="/quote" className="btn btn-primary mt-8 px-6 py-3">Request samples <ArrowRight className="size-4" aria-hidden="true" /></Link>
    </section>
  )
}
