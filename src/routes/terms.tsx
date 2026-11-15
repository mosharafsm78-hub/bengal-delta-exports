import { createFileRoute } from '@tanstack/react-router'
import { pageHead } from '@/lib/head'
import { SITE } from '@/data/site'
import { PageHead } from '@/components/site-shell'

export const Route = createFileRoute('/terms')({
  head: () => pageHead('/terms'),
  component: Terms,
})

const SECTIONS: [string, string[]][] = [
  ['Prices and information on this website', [
    'All prices are indicative FOB prices in US dollars, updated November 2026. They are not offers. Prices depend on quantity, specification, season and the date of order.',
    'Duty, shipping and route information is general guidance. Your customs broker confirms the duty for your HS code.',
  ]],
  ['How a contract is made', [
    'A contract exists only when you accept our proforma invoice and your bank issues a 100% irrevocable Letter of Credit at sight in our favour that we accept. The proforma invoice and the LC set the product specification, quantity, price, Incoterm and shipment date.',
    'International Chamber of Commerce rules apply: UCP 600 for the LC and Incoterms 2020 for delivery terms.',
  ]],
  ['Samples', ['Sample cost and courier charges are invoiced separately and payable in advance. Ready-style samples are dispatched within 24 hours of payment; custom samples take 5–10 days. The sample cost is credited against your first order.']],
  ['Quality and claims', ['Goods are inspected before shipment against the agreed specification. Any claim must be made in writing within 14 days of the goods arriving at the destination port, with photos and an independent survey report where relevant.']],
  ['Photos', ['Product photos on this website illustrate the product type and come from Pexels under the Pexels License. Before shipment we send you photos and video of your actual goods.']],
  ['Governing law', ['These terms and any contract with us are governed by the laws of Bangladesh. Disputes are settled first by negotiation, then by arbitration in Chattogram, unless the proforma invoice states otherwise.']],
  ['Contact', [`${SITE.name}, ${SITE.address}. ${SITE.email}`]],
]

function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12">
      <PageHead eyebrow="Legal" title="Terms of trade and website use" lead={`Last updated ${SITE.updated}.`} />
      <div className="grid gap-8">
        {SECTIONS.map(([t, ps]) => (
          <section key={t}>
            <h2 className="mt-0 mb-3 text-2xl">{t}</h2>
            {ps.map((p) => <p key={p} className="mt-0 mb-3 text-[16px] leading-relaxed text-muted-foreground">{p}</p>)}
          </section>
        ))}
      </div>
    </div>
  )
}
