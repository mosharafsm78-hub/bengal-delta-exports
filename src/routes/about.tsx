import { createFileRoute, Link } from '@tanstack/react-router'
import { pageHead } from '@/lib/head'
import { SITE } from '@/data/site'
import { PageHead } from '@/components/site-shell'

export const Route = createFileRoute('/about')({
  head: () => pageHead('/about'),
  component: About,
})

function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <PageHead eyebrow="About us" title="A Chattogram trading house with its own factories" />
          <div className="max-w-[65ch] space-y-4 text-[17px] leading-relaxed">
            <p>{SITE.name} is the export arm of a Bangladeshi manufacturing group that has made and sold footwear and fashion since 2022, with its own factories, two warehouses and experience centres in Dhaka and Chattogram. Our founder brings more than 15 years of business experience across fashion, branding and international sourcing.</p>
            <p>We export what we make, and we source what we don't from mills, factories, farms and artisan groups we audit ourselves. You get factory pricing with one accountable exporter, one contract and one set of documents.</p>
            <p>Bangladesh is the world's second-largest garment exporter and earned $48 billion from exports in FY2025-26. Beyond garments it grows and makes footwear, leather, jute, towels, vegetables, fruit, shrimp and handicrafts. Our job is to make all of that easy to buy from anywhere.</p>
          </div>
          <Link to="/quote" className="btn btn-primary mt-8">Talk to our sales team</Link>
        </div>
        <div className="h-fit rounded-lg border border-border bg-card p-7">
          <h2 className="mt-0 mb-4 text-xl">Company details</h2>
          <dl className="m-0 grid gap-4 text-[15px]">
            {[['Offices', SITE.offices.join(' · ')], ['Export gateways', 'Chattogram Port · Dhaka (Hazrat Shahjalal) air cargo'], ['Registration', 'Export Registration Certificate (ERC), Trade Licence, TIN, BIN'], ['Sales email', SITE.email], ['Office hours', SITE.hours]].map(([k, v]) => (
              <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="m-0 font-semibold">{v}</dd></div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
