import { AlertCircle, ArrowRight, Flame } from 'lucide-react'
import { usd } from '@/lib/slug'
import type { PageProps } from './AdminApp'
import { ago, countBy, daysAgo, fetchAll, fmtDate, pct, sb, SUPPLIER_STAGES, tzCountry, type Contact, type Lead, type WebEvent } from './client'
import { Badge, Bars, Card, ErrorNote, Kpi, Loading, Spark, useAsync } from './ui'

async function load() {
  const since = daysAgo(30)
  const [leads, suppliers, contacts, sends, web] = await Promise.all([
    fetchAll<Lead>((a, b) => sb().from('bde_leads').select('*').order('created_at', { ascending: false }).range(a, b)),
    sb().from('bde_suppliers').select('id, stage, company, created_at').then((r) => r.data ?? []),
    fetchAll<Contact>((a, b) => sb().from('bde_contacts').select('id, email, name, company, country, status, score, last_open_at, last_click_at, last_visit_at, tags').range(a, b)),
    fetchAll<{ status: string; open_count: number; click_count: number; sent_at: string }>((a, b) => sb().from('bde_sends').select('status, open_count, click_count, sent_at').gte('created_at', since).range(a, b)),
    fetchAll<WebEvent>((a, b) => sb().from('bde_web_events').select('*').gte('created_at', since).order('id').range(a, b)),
  ])
  return { leads, suppliers, contacts, sends, web }
}

export function Dashboard({ go }: PageProps) {
  const { data, error, loading } = useAsync(load, [])
  if (loading && !data) return <Loading />
  if (error) return <ErrorNote error={error} />
  const { leads, suppliers, contacts, sends, web } = data!
  const week = daysAgo(7)
  const newLeads = leads.filter((l) => l.created_at >= week)
  const open = leads.filter((l) => !['Won', 'Lost'].includes(l.stage))
  const pipeline = open.reduce((s, l) => s + Number(l.deal_value_usd || 0), 0)
  const today = new Date().toISOString().slice(0, 10)
  const due = open.filter((l) => l.next_follow_up && l.next_follow_up <= today)
  const waiting = suppliers.filter((s: any) => !['approved', 'rejected'].includes(s.stage))
  const sent = sends.filter((s) => s.status === 'sent')
  const opened = sent.filter((s) => s.open_count > 0).length
  const clicked = sent.filter((s) => s.click_count > 0).length
  const visitors7 = new Set(web.filter((e) => e.created_at >= week).map((e) => e.visitor_id)).size
  const vis = new Set(web.map((e) => e.visitor_id))
  const viewers = new Set(web.filter((e) => e.kind === 'product_view').map((e) => e.visitor_id))
  const ctas = new Set(web.filter((e) => e.kind === 'cta_click' || e.kind === 'whatsapp_click').map((e) => e.visitor_id))
  const submitted = new Set(web.filter((e) => e.kind === 'quote_submitted').map((e) => e.visitor_id))

  const days = [...Array(30)].map((_, i) => new Date(Date.now() - (29 - i) * 864e5).toISOString().slice(0, 10))
  const visitsByDay = days.map((d) => new Set(web.filter((e) => e.created_at.startsWith(d)).map((e) => e.visitor_id)).size)
  const leadsByDay = days.map((d) => leads.filter((l) => l.created_at.startsWith(d)).length)

  const hot = [...contacts].filter((c) => c.status === 'subscribed' && c.score > 0).sort((a, b) => b.score - a.score).slice(0, 6)
  const products = countBy(web.filter((e) => e.kind === 'product_view'), (e) => e.product?.replace(/-/g, ' '))
  const countries = countBy([...leads.map((l) => ({ c: l.country })), ...[...new Map(web.map((e) => [e.visitor_id, e])).values()].map((e) => ({ c: tzCountry(e.tz) }))], (r) => r.c)

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="New quote requests (7 days)" value={newLeads.length} sub={`${leads.length} in total`} tone="good" />
        <Kpi label="Open pipeline value" value={pipeline ? usd(pipeline) : '—'} sub={`${open.length} open deals`} />
        <Kpi label="Follow-ups due" value={due.length} sub="today or overdue" tone={due.length ? 'warn' : undefined} />
        <Kpi label="Suppliers to review" value={waiting.length} sub={`${suppliers.length} applications`} tone={waiting.length ? 'warn' : undefined} />
        <Kpi label="Email open / click (30 d)" value={sent.length ? `${pct(opened, sent.length)}` : '—'} sub={sent.length ? `${pct(clicked, sent.length)} clicked · ${sent.length} sent` : `${contacts.filter((c) => c.status === 'subscribed').length} contacts ready`} />
        <Kpi label="Website visitors (7 days)" value={visitors7} sub={`${vis.size} in 30 days`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card title="Last 30 days">
          <Spark labels={days.map((d) => fmtDate(d).replace(/ \d{4}$/, ''))} series={[{ name: 'Visitors', color: '#0f6b5c', values: visitsByDay }, { name: 'Quote requests', color: '#b8862b', values: leadsByDay }]} />
        </Card>
        <Card title="Buyer funnel (30 days)">
          <ul className="m-0 grid list-none gap-3 p-0">
            {([['Visited the site', vis.size], ['Looked at a product', viewers.size], ['Clicked quote, sample or WhatsApp', ctas.size], ['Sent a quote request', submitted.size]] as [string, number][]).map(([l, n], i, arr) => (
              <li key={l}>
                <div className="mb-1 flex justify-between text-[13.5px]"><span>{l}</span><b className="num">{n}{i > 0 && <span className="ml-1.5 font-normal text-muted-foreground">{pct(n, arr[i - 1][1])}</span>}</b></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand" style={{ width: `${vis.size ? (n / vis.size) * 100 : 0}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card title="Needs your attention" action={<button type="button" onClick={() => go('leads')} className="flex items-center gap-1 text-[13px] text-brand">All quotes <ArrowRight className="size-3.5" /></button>}>
          {due.length + newLeads.filter((l) => l.stage === 'New request').length === 0 ? <p className="m-0 text-sm text-muted-foreground">All caught up.</p> : (
            <ul className="m-0 grid list-none gap-2 p-0 text-[13.5px]">
              {[...new Map([...newLeads.filter((l) => l.stage === 'New request'), ...due].map((l) => [l.id, l])).values()].slice(0, 8).map((l, i) => (
                <li key={`${l.id}-${i}`} className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2">
                  <AlertCircle className="mt-0.5 size-4 flex-none text-[#b45309]" />
                  <span className="min-w-0 flex-1"><b>{l.company !== '-' ? l.company : l.name}</b>, {l.country}<span className="block text-[12px] text-muted-foreground">{l.stage === 'New request' ? `New request · ${ago(l.created_at)}` : `Follow-up due ${fmtDate(l.next_follow_up)}`}</span></span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title={<span className="flex items-center gap-1.5"><Flame className="size-4 text-[#ea580c]" />Hottest contacts</span>} action={<button type="button" onClick={() => go('contacts')} className="text-[13px] text-brand">Contacts</button>}>
          {hot.length ? (
            <ul className="m-0 grid list-none gap-2 p-0 text-[13.5px]">
              {hot.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0"><b className="block truncate">{c.company || c.name || c.email}</b><span className="text-[12px] text-muted-foreground">{c.country ?? '—'} · last active {ago(c.last_click_at ?? c.last_visit_at ?? c.last_open_at)}</span></span>
                  <Badge tone="warn">{c.score} pts</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="m-0 text-sm text-muted-foreground">Contacts earn points when they open emails (+1), click (+5), visit the site (+1 per action) and send a quote (+20).</p>}
        </Card>
        <Card title="Most viewed products (30 days)"><Bars rows={products} /></Card>
        <Card title="Where buyers come from" className="xl:col-span-1"><Bars rows={countries} empty="Appears after the first visits." /></Card>
        <Card title="Quote requests by stage">
          <Bars rows={countBy(leads, (l) => l.stage)} empty="No quote requests yet." />
        </Card>
        <Card title="Supplier pipeline"><Bars rows={countBy(suppliers as any[], (s: any) => SUPPLIER_STAGES.find((x) => x[0] === s.stage)?.[1] ?? s.stage)} empty="No supplier applications yet." /></Card>
      </div>
    </div>
  )
}
