import { createFileRoute } from '@tanstack/react-router'
import { pageHead } from '@/lib/head'
import { SITE } from '@/data/site'
import { PageHead } from '@/components/site-shell'

export const Route = createFileRoute('/privacy')({
  head: () => pageHead('/privacy'),
  component: Privacy,
})

const SECTIONS: [string, string[]][] = [
  ['Who we are', [`${SITE.name}, ${SITE.address}. Contact: ${SITE.email}.`]],
  ['What we collect', [
    'When you send a quote request, sample request, question or supplier application, we collect what you type in the form: your name, email, country, and optionally company, phone or WhatsApp number, website, products, quantities and notes.',
    'Your product list (the items you add before sending a request) is kept only in your own browser until you send it or clear it.',
    'We do not use advertising cookies or tracking pixels, and we do not sell or rent your data.',
  ]],
  ['Why we use it', [
    'To reply to your request, prepare a proforma invoice, arrange samples and manage your order.',
    'To send occasional product updates related to your request. You can ask us to stop at any time.',
  ]],
  ['Where it is stored', [
    'Requests are stored in a secure database run by Supabase (servers in Sydney, Australia). Only our team can read them.',
    'Product photos are loaded from Pexels; the website itself is hosted on GitHub Pages.',
  ]],
  ['How long we keep it', ['We keep requests for as long as needed to serve you and meet export record-keeping rules, normally up to 6 years for orders and 2 years for requests that did not lead to an order.']],
  ['Your rights', [`You can ask to see, correct or delete your data, or object to emails, by writing to ${SITE.email}. We reply within 30 days. If you are in the EU or UK, you may also complain to your data protection authority.`]],
]

function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12">
      <PageHead eyebrow="Legal" title="Privacy policy" lead={`How ${SITE.name} handles the information you send us. Last updated ${SITE.updated}.`} />
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
