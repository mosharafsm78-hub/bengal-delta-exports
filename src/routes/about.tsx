import { createFileRoute, Link } from '@tanstack/react-router'
import { Handshake, ShieldCheck, Landmark, Factory, UserRound, Search, Shirt, ClipboardCheck, FileText, Ship, Headset, Palette, Calculator, Users, MapPin, CalendarDays } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { SITE } from '@/data/site'
import { catStyle } from '@/lib/cat-style'

export const Route = createFileRoute('/about')({
  head: () => pageHead('/about'),
  component: About,
})

const HISTORY: [string, string, string][] = [
  ['2022', 'Founded in Chattogram', 'BengalExport was founded in Chattogram, close to Bangladesh\'s main seaport, to help overseas buyers source from Bangladesh.'],
  ['Growing', 'A verified sourcing network', 'We built relationships with garment and home-textile mills, footwear and leather factories, jute mills, farms and artisan groups, and a process to check each one.'],
  ['Growing', 'A team of about 22', 'Sourcing, quality control, documentation, logistics and sales under one roof in Chattogram.'],
  ['2026', 'BengalExport export hub', 'We opened our catalogue to importers worldwide: one exporter for clothing, footwear, fresh produce, food, jute, home textiles and handicrafts.'],
]

const DEPARTMENTS: [typeof Search, string, string, string][] = [
  [Search, 'garments', 'Sourcing and supplier verification', 'Finds producers, checks their documents and visits every factory and farm before they join.'],
  [Shirt, 'footwear', 'Merchandising and sampling', 'Turns your specification into samples, and samples into a production order.'],
  [ClipboardCheck, 'produce', 'Quality control', 'Checks materials, production and finished goods; books third-party inspectors when you ask.'],
  [FileText, 'home', 'Export documents and LC', 'Checks your LC, prepares invoices, certificates of origin and phytosanitary papers, and presents documents to the bank.'],
  [Ship, 'jute', 'Logistics and shipping', 'Books containers and air cargo, handles customs and sends you tracking.'],
  [Headset, 'crafts', 'Sales and buyer support', 'Answers within one working day, sends proforma invoices and keeps you updated at every step.'],
  [Palette, 'food', 'Design and product development', 'Our in-house design team helps with private-label packaging, labels and new styles.'],
  [Calculator, 'garments', 'Accounts and finance', 'Handles LCs with our bank, supplier payments and export-proceeds compliance.'],
]

function About() {
  const reg = SITE.registration
  const regRows: [string, string][] = ([
    ['Export Registration Certificate (ERC)', reg.erc],
    ['Trade licence', reg.tradeLicence],
    ['TIN', reg.tin],
    ['BIN (VAT registration)', reg.bin],
  ] as [string, string][]).filter(([, v]) => v)
  const details: [string, string][] = ([
    ['Head office', SITE.address],
    ['Offices', SITE.offices.join(' · ')],
    ['Export gateways', 'Chattogram Port · Dhaka (Hazrat Shahjalal) air cargo'],
    ['Phone', SITE.phone],
    ['WhatsApp', SITE.whatsappDisplay],
    ['Email', SITE.email],
    ['Office hours', SITE.hours],
  ] as [string, string][]).filter(([, v]) => v)

  return (
    <div>
      {/* Intro */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="eyebrow mb-3 text-jute">About {SITE.name}</div>
          <h1 className="m-0 max-w-4xl text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.06] text-paper">A Chattogram company that makes, sources and exports the best of Bangladesh.</h1>
          <p className="mt-5 max-w-[62ch] text-lg text-paper/80">{SITE.name} was founded in 2022 in Chattogram. Today a team of about 22 people helps importers buy clothing, footwear, fresh produce, food, jute and home textiles from one accountable exporter.</p>
          <dl className="m-0 mt-10 grid max-w-3xl grid-cols-3 gap-6">
            {[[CalendarDays, '2022', 'Founded'], [Users, '≈ 22', 'People on our team'], [MapPin, 'Chattogram', 'Head office, West Khulshi']].map(([I, b, s]) => {
              const Icon = I as typeof Users
              return (
                <div key={s as string}>
                  <Icon className="size-5 text-jute" aria-hidden="true" />
                  <dt className="num mt-2 font-display text-3xl font-semibold">{b as string}</dt>
                  <dd className="m-0 text-[14px] text-paper/70">{s as string}</dd>
                </div>
              )
            })}
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {/* History */}
        <section className="pt-16">
          <h2 className="m-0 mb-8 text-[clamp(1.8rem,3.4vw,2.4rem)]">Our story</h2>
          <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-4">
            {HISTORY.map(([y, t, d], i) => (
              <li key={t} className="relative rounded-xl border border-border bg-card p-6">
                <span className={`inline-block rounded-full px-3 py-1 text-[13px] font-semibold ${i === HISTORY.length - 1 ? 'bg-brand text-brand-ink' : 'bg-jute-soft text-jute'}`}>{y}</span>
                <h3 className="mt-4 mb-0 text-[17px]">{t}</h3>
                <p className="mt-1.5 mb-0 text-[14.5px] text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* How we work */}
        <section className="pt-16">
          <h2 className="m-0 mb-2 text-[clamp(1.8rem,3.4vw,2.4rem)]">How we work</h2>
          <p className="mt-0 mb-8 max-w-[70ch] text-muted-foreground">We are the seller, not a directory. We buy from verified producers and sell to you under our own contract and invoice, so one company is responsible for your whole order.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Handshake, 'One contract with us', 'You buy from BengalExport. We buy from the factory or farm and manage them for you.'],
              [Landmark, 'You pay by 100% LC', 'Your LC is opened in our name. Your bank pays only against shipping documents.'],
              [ShieldCheck, 'Checked before shipping', 'Every order is inspected by our QC team, or by your own inspector.'],
              [Factory, 'Producers paid by us', 'Factories and farms sell to us in Bangladesh, in Taka. They never handle export paperwork.'],
            ].map(([I, t, d]) => {
              const Icon = I as typeof Handshake
              return (
                <div key={t as string} className="rounded-xl border border-border bg-card p-6">
                  <Icon className="size-6 text-brand" aria-hidden="true" />
                  <h3 className="mt-3 mb-0 text-[17px]">{t as string}</h3>
                  <p className="mt-1.5 mb-0 text-[14.5px] text-muted-foreground">{d as string}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Team */}
        <section className="pt-16">
          <h2 className="m-0 mb-2 text-[clamp(1.8rem,3.4vw,2.4rem)]">Our team: about 22 people, 8 departments</h2>
          <p className="mt-0 mb-8 max-w-[70ch] text-muted-foreground">Each order passes through the same people, from your first email to the day your goods arrive.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEPARTMENTS.map(([Icon, c, t, d]) => (
              <div key={t} style={catStyle(c)} className="rounded-xl border border-border bg-card p-6">
                <span className="cat-soft cat-text grid size-11 place-items-center rounded-lg"><Icon className="size-5" aria-hidden="true" /></span>
                <h3 className="mt-4 mb-0 text-[16.5px]">{t}</h3>
                <p className="mt-1.5 mb-0 text-[14px] text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Founder + details */}
        <section className="grid gap-6 pt-16 lg:grid-cols-[1.2fr_.8fr]">
          <div className="flex h-fit gap-5 rounded-2xl bg-brand-soft p-7">
            <span className="grid size-16 flex-none place-items-center rounded-full bg-brand text-brand-ink"><UserRound className="size-8" aria-hidden="true" /></span>
            <div>
              <div className="eyebrow">Founder</div>
              <p className="m-0 mt-1 font-display text-2xl font-semibold">{SITE.founder}</p>
              <p className="m-0 mt-1 text-[15px] text-muted-foreground">{SITE.founderRole}. More than 15 years in business across fashion, branding and international sourcing.</p>
              <p className="m-0 mt-3 text-[15px]">“We built {SITE.name} so that a buyer anywhere can order from Bangladesh as easily and safely as from home: clear prices, real samples, and payment through their own bank.”</p>
            </div>
          </div>
          <aside className="grid gap-5">
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
          </aside>
        </section>

        <section className="pt-16">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand p-10 text-brand-ink md:flex-row md:items-center">
            <div>
              <h2 className="m-0 text-[clamp(1.6rem,3vw,2.2rem)]">Work with us</h2>
              <p className="mt-2 mb-0 opacity-90">Buyers get a firm price in 24 hours. Producers can apply to become verified suppliers.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/suppliers" className="btn border border-brand-ink/40 text-brand-ink">Become a supplier</Link>
              <Link to="/quote" className="btn bg-white text-brand">Get a free quote</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
