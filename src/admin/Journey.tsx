import { Eye, Mail, MousePointerClick, Send } from 'lucide-react'
import { fmtTime, sb, type WebEvent } from './client'
import { useAsync } from './ui'

type Item = { at: string; icon: typeof Eye; text: string }

const KIND: Record<string, string> = {
  page_view: 'Viewed page', product_view: 'Viewed product', category_view: 'Viewed category', section_view: 'Read section', cta_click: 'Clicked', whatsapp_click: 'Clicked WhatsApp',
  email_click: 'Clicked email link', phone_click: 'Clicked phone', quote_submitted: 'Sent a quote request', click: 'Clicked',
}

/** Everything one buyer did: emails opened and clicked, pages and products viewed, quote sent. */
export function Journey({ contactId, visitorId }: { contactId?: number | null; visitorId?: string | null }) {
  const { data, loading } = useAsync(async () => {
    const items: Item[] = []
    const or = [contactId ? `contact_id.eq.${contactId}` : '', visitorId ? `visitor_id.eq.${visitorId}` : ''].filter(Boolean).join(',')
    if (or) {
      const { data: web } = await sb().from('bde_web_events').select('*').or(or).order('created_at', { ascending: false }).limit(150)
      for (const e of (web ?? []) as WebEvent[]) {
        const what = e.product ? e.product.replace(/-/g, ' ') : e.label ?? e.path ?? ''
        items.push({ at: e.created_at, icon: e.kind === 'quote_submitted' ? Send : e.kind.includes('click') ? MousePointerClick : Eye, text: `${KIND[e.kind] ?? e.kind}: ${what}${e.utm_source === 'email' ? ' (from email)' : ''}` })
      }
    }
    if (contactId) {
      const { data: ev } = await sb().from('bde_email_events').select('created_at, kind, url, campaign_id, bde_campaigns(name)').eq('contact_id', contactId).order('created_at', { ascending: false }).limit(100)
      for (const e of (ev ?? []) as any[]) {
        const name = e.bde_campaigns?.name ?? `campaign ${e.campaign_id}`
        items.push({ at: e.created_at, icon: Mail, text: e.kind === 'open' ? `Opened email "${name}"` : e.kind === 'click' ? `Clicked in "${name}": ${String(e.url).replace(/^https?:\/\//, '').split('?')[0]}` : `${e.kind} — ${name}` })
      }
    }
    return items.sort((a, b) => b.at.localeCompare(a.at))
  }, [contactId, visitorId])
  if (loading) return <p className="text-sm text-muted-foreground">Loading activity…</p>
  if (!data?.length) return <p className="text-sm text-muted-foreground">No tracked activity yet.</p>
  return (
    <ol className="m-0 grid list-none gap-0 border-l-2 border-border p-0 pl-4">
      {data.slice(0, 60).map((i, n) => (
        <li key={n} className="relative pb-3 text-[13.5px]">
          <span className="absolute top-0.5 -left-[25px] grid size-4 place-items-center rounded-full bg-card"><i.icon className="size-3.5 text-brand" /></span>
          <span>{i.text}</span>
          <span className="block text-[11.5px] text-muted-foreground">{fmtTime(i.at)}</span>
        </li>
      ))}
    </ol>
  )
}
