import { createFileRoute, Link } from '@tanstack/react-router'
import { pageHead } from '@/lib/head'
import { FAQ } from '@/data/site'
import { PageHead } from '@/components/site-shell'

export const Route = createFileRoute('/faq')({
  head: () => ({
    ...pageHead('/faq'),
    scripts: [{ type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }) }],
  }),
  component: Faq,
})

function Faq() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-12">
      <PageHead eyebrow="FAQ" title="Questions importers ask first" />
      <div className="grid gap-3">
        {FAQ.map(([q, a], i) => (
          <details key={q} open={i < 2} className="rounded-lg border border-border bg-card px-6 py-4">
            <summary className="cursor-pointer text-[17px] font-semibold">{q}</summary>
            <p className="mt-3 mb-0 text-[15.5px] text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8">Still have a question? <Link to="/quote" search={{ tab: 'requirement' }} className="font-semibold text-brand">Ask us directly</Link>.</p>
    </div>
  )
}
