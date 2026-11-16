import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { PageProps } from './AdminApp'
import { countBy, daysAgo, fetchAll, fmtDate, pct, sb, tzCountry, type WebEvent } from './client'
import { Bars, Card, ErrorNote, Kpi, Loading, Spark, useAsync } from './ui'

const host = (r: string | null) => { try { return r ? new URL(r).hostname.replace(/^www\./, '') : null } catch { return null } }

export function Analytics(_: PageProps) {
  const [days, setDays] = useState(30)
  const { data, error, loading } = useAsync(() => fetchAll<WebEvent>((a, b) => sb().from('bde_web_events').select('*').gte('created_at', daysAgo(days)).order('id').range(a, b), 100000), [days])
  if (error) return <ErrorNote error={error} />
  const ev = data ?? []
  const visitors = new Set(ev.map((e) => e.visitor_id))
  const sessions = new Set(ev.map((e) => e.session_id))
  const views = ev.filter((e) => ['page_view', 'product_view', 'category_view'].includes(e.kind))
  const firstByVisitor = [...new Map([...ev].reverse().map((e) => [e.visitor_id, e])).values()]
  const sess = new Map<string, Set<string | null>>(); for (const e of ev) { if (!sess.has(e.visitor_id)) sess.set(e.visitor_id, new Set()); sess.get(e.visitor_id)!.add(e.session_id) }
  const returning = [...sess.values()].filter((s) => s.size > 1).length
  const n = Math.min(days, 90)
  const labels = [...Array(n)].map((_, i) => new Date(Date.now() - (n - 1 - i) * 864e5).toISOString().slice(0, 10))
  const source = (e: WebEvent) => e.utm_source === 'email' ? 'Our emails' : e.utm_source ? e.utm_source : host(e.referrer) ?? 'Direct / typed'

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-2">
        {[7, 30, 90].map((d) => <button key={d} type="button" onClick={() => setDays(d)} className={cn('rounded-full border px-3 py-1 text-[13px] font-medium', days === d ? 'border-brand bg-brand text-white' : 'border-border bg-card')}>Last {d} days</button>)}
        {loading && <span className="text-[13px] text-muted-foreground">Loading…</span>}
      </div>
      {loading && !data ? <Loading /> : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Visitors" value={visitors.size} sub={`${returning} came back`} tone="good" />
            <Kpi label="Visits" value={sessions.size} sub={`${(views.length / Math.max(1, sessions.size)).toFixed(1)} pages per visit`} />
            <Kpi label="Product views" value={ev.filter((e) => e.kind === 'product_view').length} />
            <Kpi label="Quote / sample clicks" value={ev.filter((e) => e.kind === 'cta_click').length} />
            <Kpi label="WhatsApp clicks" value={ev.filter((e) => e.kind === 'whatsapp_click').length} />
            <Kpi label="Quote requests sent" value={ev.filter((e) => e.kind === 'quote_submitted').length} sub={pct(new Set(ev.filter((e) => e.kind === 'quote_submitted').map((e) => e.visitor_id)).size, visitors.size) + ' of visitors'} tone="good" />
          </div>
          <Card title="Visitors per day">
            <Spark labels={labels.map((d) => fmtDate(d).replace(/ \d{4}$/, ''))} series={[{ name: 'Visitors', color: '#0f6b5c', values: labels.map((d) => new Set(ev.filter((e) => e.created_at.startsWith(d)).map((e) => e.visitor_id)).size) }, { name: 'Quote requests', color: '#b8862b', values: labels.map((d) => ev.filter((e) => e.kind === 'quote_submitted' && e.created_at.startsWith(d)).length) }]} />
          </Card>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <Card title="Most viewed products"><Bars rows={countBy(ev.filter((e) => e.kind === 'product_view'), (e) => e.product?.replace(/-/g, ' '))} max={10} /></Card>
            <Card title="Most viewed categories"><Bars rows={countBy(ev.filter((e) => e.kind === 'category_view' || e.kind === 'product_view'), (e) => e.category?.replace(/-/g, ' '))} max={10} /></Card>
            <Card title="Most read sections (what holds attention)"><Bars rows={countBy(ev.filter((e) => e.kind === 'section_view'), (e) => e.label)} max={10} /></Card>
            <Card title="Top pages"><Bars rows={countBy(views, (e) => e.path)} max={10} /></Card>
            <Card title="Buttons clicked"><Bars rows={countBy(ev.filter((e) => e.kind.endsWith('click')), (e) => `${e.label ?? e.kind}`)} max={10} /></Card>
            <Card title="Where visitors come from"><Bars rows={countBy(firstByVisitor, source)} max={10} /></Card>
            <Card title="Countries (from time zone)"><Bars rows={countBy(firstByVisitor, (e) => tzCountry(e.tz))} max={10} /></Card>
            <Card title="Devices"><Bars rows={countBy(firstByVisitor, (e) => e.device)} /></Card>
            <Card title="Browser languages"><Bars rows={countBy(firstByVisitor, (e) => e.lang?.split('-')[0])} max={8} /></Card>
          </div>
          <p className="m-0 text-[12.5px] text-muted-foreground">Privacy-friendly analytics: no cookies and no third-party tracking. Visitors are counted with a random browser id. Your own visits while signed in to this panel are not counted.</p>
        </>
      )}
    </div>
  )
}
