import { createFileRoute, Link } from '@tanstack/react-router'
import { Handshake, ShieldCheck, Landmark, Factory, UserRound } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { SITE } from '@/data/site'
import { PageHead } from '@/components/site-shell'

export const Route = createFileRoute('/about')({
  head: () => pageHead('/about'),
  component: About,
})

function About() {
  const reg = SITE.registration
  const regRows: [string, string][] = ([
    ['Export Registration Certificate (ERC)', reg.erc],
    ['Trade licence', reg.tradeLicence],
    ['TIN', reg.tin],
    ['BIN (VAT registration)', reg.bin],
  ] as [string, string][]).filter(([, v]) => v)
  const details: [string, string][] = ([
    ['Address', SITE.address],
    ['Offices', SITE.offices.join(' · ')],
    ['Export gateways', 'Chattogram Port · Dhaka (Hazrat Shahjalal) air cargo'],
    ['Phone', SITE.phone],
    ['WhatsApp', SITE.whatsappDisplay],
    ['Email', SITE.email],
    ['Office hours', SITE.hours],
  ] as [string, string][]).filter(([, v]) => v)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <PageHead eyebrow="About us" title="One exporter between you and Bangladesh's best producers" />
          <div className="max-w-[65ch] space-y-4 text-[17px] leading-relaxed">
            <p>{SITE.name} is an export trading house in Chattogram, Bangladesh. We are part of a manufacturing group that has made and sold footwear and fashion since 2022, with its own factories, two warehouses and experience centres in Dhaka and Chattogram.</p>
            <p>We export what we make, and we source what we don't from mills, factories, farms and artisan groups that we verify ourselves.</p>
          </div>

          <h2 className="mt-12 mb-5 text-[clamp(1.6rem,3vw,2.1rem)]">How we work</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [Handshake, 'We are the seller', 'We buy from verified producers and sell to you under our own contract and invoice. One company is responsible for your whole order.'],
              [Landmark, 'You pay us by LC', 'Your 100% LC at sight is opened in our name. Your bank pays only against shipping documents.'],
              [ShieldCheck, 'We check before we ship', 'Every order is inspected by us, or by your third-party inspector, before it leaves Bangladesh.'],
              [Factory, 'Producers get paid by us', 'Factories and farms sell to us in Bangladesh. They never need to handle foreign payments or export paperwork.'],
            ].map(([I, t, d]) => {
              const Icon = I as typeof Handshake
              return (
                <div key={t as string} className="rounded-xl border border-border bg-card p-5">
                  <Icon className="size-6 text-brand" aria-hidden="true" />
                  <h3 className="mt-3 mb-0 text-[17px]">{t as string}</h3>
                  <p className="mt-1.5 mb-0 text-[14.5px] text-muted-foreground">{d as string}</p>
                </div>
              )
            })}
          </div>
          <p className="mt-5 text-[15px] text-muted-foreground">Are you a Bangladeshi producer? <Link to="/suppliers" className="font-semibold text-brand">Become a verified supplier</Link>.</p>

          <div className="mt-12 flex gap-5 rounded-2xl bg-brand-soft p-6">
            <span className="grid size-16 flex-none place-items-center rounded-full bg-brand text-brand-ink"><UserRound className="size-8" aria-hidden="true" /></span>
            <div>
              <div className="eyebrow">Founder</div>
              <p className="m-0 mt-1 font-display text-2xl font-semibold">{SITE.founder}</p>
              <p className="m-0 text-[15px] text-muted-foreground">{SITE.founderRole}. More than 15 years in business across fashion, footwear manufacturing, branding and international sourcing.</p>
            </div>
          </div>
        </div>

        <aside className="grid h-fit gap-5">
          <div className="rounded-2xl border border-border bg-card p-7">
            <h2 className="mt-0 mb-4 text-xl">Company details</h2>
            <dl className="m-0 grid gap-4 text-[15px]">
              {details.map(([k, v]) => (
                <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="m-0 font-semibold">{v}</dd></div>
              ))}
            </dl>
          </div>
          {regRows.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-7">
              <h2 className="mt-0 mb-4 text-xl">Registration</h2>
              <dl className="m-0 grid gap-4 text-[15px]">
                {regRows.map(([k, v]) => (
                  <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="num m-0 font-semibold">{v}</dd></div>
                ))}
              </dl>
              <p className="mt-4 mb-0 text-[13px] text-muted-foreground">Copies are sent with every proforma invoice.</p>
            </div>
          )}
          <Link to="/quote" className="btn btn-primary py-3.5">Get a free quote</Link>
        </aside>
      </div>
    </div>
  )
}
