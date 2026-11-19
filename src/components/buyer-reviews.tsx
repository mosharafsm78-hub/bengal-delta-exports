import { useEffect, useState } from 'react'
import { Quote } from 'lucide-react'

type Review = { id: number; quote: string; person: string | null; company: string | null; country: string; product: string | null; source: string }
const SRC: Record<string, string> = { email: 'by email', whatsapp: 'on WhatsApp', call: 'on a call', visit: 'in a meeting', other: '' }

/** "What buyers say": real feedback the team pasted in the admin panel. Hidden until there is at least one. */
export function BuyerReviews() {
  const [list, setList] = useState<Review[]>([])
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined
    if (!url || !key) return
    fetch(`${url}/rest/v1/rpc/bde_public_testimonials`, { method: 'POST', headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: '{}' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => Array.isArray(d) && setList(d))
      .catch(() => {})
  }, [])
  if (!list.length) return null
  return (
    <section className="mx-auto max-w-7xl px-4 pt-20">
      <div className="mb-8 max-w-2xl">
        <h2 className="m-0 text-[clamp(1.8rem,3.4vw,2.5rem)]">What buyers say</h2>
        <p className="mt-2 mb-0 text-muted-foreground">Feedback from importers who sourced from Bangladesh through us, in their own words.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <figure key={r.id} className="m-0 flex flex-col rounded-2xl border border-border bg-card p-6">
            <Quote className="size-6 text-brand" aria-hidden="true" />
            <blockquote className="m-0 mt-3 flex-1 text-[15.5px] leading-relaxed whitespace-pre-wrap">{r.quote}</blockquote>
            <figcaption className="mt-4 text-[13px] text-muted-foreground">
              <span className="font-semibold text-foreground">{r.person || r.company || 'Importer'}</span>
              {r.person && r.company ? `, ${r.company}` : ''} · {r.country}
              {r.product ? <><br />Sourced {r.product}{SRC[r.source] ? `, said ${SRC[r.source]}` : ''}</> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
