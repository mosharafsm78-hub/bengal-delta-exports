import { useMemo, useState } from 'react'
import { Copy, Download, Lightbulb, MessageCircle, Search, Sparkles } from 'lucide-react'
import { leadScore, nextAction } from './smart'
import { cn } from '@/lib/utils'
import { usd } from '@/lib/slug'
import type { PageProps } from './AdminApp'
import { ago, ai, fetchAll, fmtDate, LEAD_STAGES, sb, type Lead } from './client'
import { Journey } from './Journey'
import { logActivity, Notes } from './Notes'
import { Badge, btn, Card, Drawer, Empty, ErrorNote, Field, input, Loading, useAsync } from './ui'

const stageTone = (s: string) => (s === 'Won' ? 'good' : s === 'Lost' ? 'bad' : s === 'New request' ? 'warn' : 'info') as 'good' | 'bad' | 'warn' | 'info'

export function csv(rows: Record<string, unknown>[], name: string) {
  if (!rows.length) return
  const cols = Object.keys(rows[0])
  const esc = (v: unknown) => `"${String(Array.isArray(v) ? v.join('; ') : typeof v === 'object' && v ? JSON.stringify(v) : v ?? '').replace(/"/g, '""')}"`
  const blob = new Blob([[cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click()
}

export function Leads({ me }: PageProps) {
  const { data, error, loading, reload } = useAsync(() => fetchAll<Lead>((a, b) => sb().from('bde_leads').select('*').order('created_at', { ascending: false }).range(a, b)), [])
  const team = useAsync(async () => (await sb().from('bde_admins').select('email, name')).data ?? [], [])
  const [stage, setStage] = useState('Open')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Lead | null>(null)
  const rows = useMemo(() => (data ?? []).filter((l) => (stage === 'All' ? true : stage === 'Open' ? !['Won', 'Lost'].includes(l.stage) : l.stage === stage) && (!q || JSON.stringify(l).toLowerCase().includes(q.toLowerCase()))), [data, stage, q])
  if (loading && !data) return <Loading />
  if (error) return <ErrorNote error={error} />
  const counts = (s: string) => (data ?? []).filter((l) => l.stage === s).length

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {['Open', ...LEAD_STAGES, 'All'].map((s) => (
          <button key={s} type="button" onClick={() => setStage(s)} className={cn('rounded-full border px-3 py-1 text-[13px] font-medium', stage === s ? 'border-brand bg-brand text-white' : 'border-border bg-card hover:border-brand')}>
            {s}{LEAD_STAGES.includes(s as any) && <span className="ml-1 opacity-70">{counts(s)}</span>}
          </button>
        ))}
        <div className="relative ml-auto"><Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" /><input className={cn(input, 'w-56 pl-8')} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <button type="button" onClick={() => csv(rows, 'quote-requests.csv')} className={cn(btn, 'btn-outline')}><Download className="size-4" />CSV</button>
      </div>

      {!rows.length ? <Empty title="No quote requests here yet">Requests from the website quote form appear here instantly, with the buyer's full journey.</Empty> : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[860px] text-[13.5px]">
            <thead><tr className="border-b border-border bg-muted/60 text-left text-[12px] text-muted-foreground uppercase">{['Received', 'Buyer', 'Fit', 'Country', 'Products', 'Value', 'Stage', 'Owner', 'Follow-up'].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((l) => {
                const overdue = l.next_follow_up && l.next_follow_up <= new Date().toISOString().slice(0, 10) && !['Won', 'Lost'].includes(l.stage)
                return (
                  <tr key={l.id} onClick={() => setSel(l)} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-3 py-2.5 whitespace-nowrap">{ago(l.created_at)}<span className="block text-[11.5px] text-muted-foreground">{l.reference}</span></td>
                    <td className="px-3 py-2.5"><b>{l.company !== '-' ? l.company : l.name}</b><span className="block text-[12px] text-muted-foreground">{l.name} · {l.buyer_type ?? ''}</span></td>
                    <td className="px-3 py-2.5"><ScoreBadge l={l} /></td>
                    <td className="px-3 py-2.5">{l.country}{l.port && <span className="block text-[12px] text-muted-foreground">{l.port}</span>}</td>
                    <td className="max-w-[240px] px-3 py-2.5"><span className="line-clamp-2">{(l.items ?? []).map((i: any) => i.style).join(', ') || l.requirement || '—'}</span></td>
                    <td className="num px-3 py-2.5">{l.deal_value_usd ? usd(Number(l.deal_value_usd)) : '—'}</td>
                    <td className="px-3 py-2.5"><Badge tone={stageTone(l.stage)}>{l.stage}</Badge></td>
                    <td className="px-3 py-2.5">{l.owner ?? <span className="text-muted-foreground">Unassigned</span>}</td>
                    <td className={cn('px-3 py-2.5 whitespace-nowrap', overdue && 'font-semibold text-[#b45309]')}>{fmtDate(l.next_follow_up)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={!!sel} onClose={() => { setSel(null); reload() }} title={sel ? `${sel.company !== '-' ? sel.company : sel.name} · ${sel.reference}` : ''}>
        {sel && <LeadDetail lead={sel} me={me} team={(team.data ?? []) as any[]} onSaved={(l) => setSel(l)} />}
      </Drawer>
    </div>
  )
}

function LeadDetail({ lead, me, team, onSaved }: { lead: Lead; me: string; team: { email: string; name: string }[]; onSaved: (l: Lead) => void }) {
  const [f, setF] = useState({ stage: lead.stage, owner: lead.owner ?? '', next_follow_up: lead.next_follow_up ?? '', deal_value_usd: lead.deal_value_usd ?? '' })
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    const patch = { ...f, owner: f.owner || null, next_follow_up: f.next_follow_up || null, deal_value_usd: f.deal_value_usd === '' ? null : Number(f.deal_value_usd), last_activity_at: new Date().toISOString() }
    const { data } = await sb().from('bde_leads').update(patch).eq('id', lead.id).select().single()
    const changes = Object.entries(patch).filter(([k, v]) => k !== 'last_activity_at' && String(v ?? '') !== String((lead as any)[k] ?? '')).map(([k, v]) => `${k.replace(/_/g, ' ')} → ${v ?? 'none'}`)
    if (changes.length) await logActivity('lead', lead.id, me, changes.join(' · '))
    setSaving(false); if (data) onSaved(data as Lead)
  }
  return (
    <div className="grid gap-5">
      <SmartBox lead={lead} />
      <Card title="Deal">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Stage"><select className={input} value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })}>{LEAD_STAGES.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Owner"><select className={input} value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })}><option value="">Unassigned</option>{team.map((t) => <option key={t.email} value={t.name || t.email}>{t.name || t.email}</option>)}</select></Field>
          <Field label="Next follow-up"><input type="date" className={input} value={f.next_follow_up} onChange={(e) => setF({ ...f, next_follow_up: e.target.value })} /></Field>
          <Field label="Deal value (USD)"><input inputMode="decimal" className={input} value={f.deal_value_usd} onChange={(e) => setF({ ...f, deal_value_usd: e.target.value.replace(/[^\d.]/g, '') })} /></Field>
        </div>
        <button type="button" onClick={save} disabled={saving} className={cn(btn, 'btn-primary mt-4')}>{saving ? 'Saving…' : 'Save'}</button>
      </Card>
      <Card title="Request">
        <dl className="m-0 grid grid-cols-[140px_1fr] gap-x-3 gap-y-2 text-[13.5px]">
          {([['Received', new Date(lead.created_at).toLocaleString('en-GB')], ['Type', lead.kind], ['Name', lead.name], ['Email', lead.email], ['Phone', lead.phone], ['Company', lead.company], ['Buyer type', lead.buyer_type], ['Website', lead.website], ['Country / port', [lead.country, lead.port].filter(Boolean).join(', ')], ['Delivery terms', lead.incoterm], ['Quantity', [lead.quantity, lead.unit].filter(Boolean).join(' ')], ['Needed by', lead.needed_by], ['Certificates', (lead.certificates ?? []).join(', ')], ['Requirement', lead.requirement], ['Notes', lead.notes], ['From page', lead.source_page]] as [string, unknown][]).filter(([, v]) => v && v !== '-').map(([k, v]) => (
            <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd className="m-0 break-words whitespace-pre-wrap">{String(v)}</dd></div>
          ))}
        </dl>
        {!!lead.items?.length && (
          <table className="mt-4 w-full text-[13px]"><thead><tr className="text-left text-muted-foreground"><th className="py-1">Product</th><th>Qty</th><th>Estimate</th></tr></thead>
            <tbody>{lead.items.map((i: any, n: number) => <tr key={n} className="border-t border-border"><td className="py-1.5">{i.style}<span className="block text-[11.5px] text-muted-foreground">{i.family}{i.spec ? ` · ${i.spec}` : ''}</span></td><td>{i.qty ?? '—'}</td><td>{i.estimate ?? '—'}</td></tr>)}</tbody></table>
        )}
      </Card>
      <Card title="Notes and history"><Notes entity="lead" id={lead.id} me={me} /></Card>
      <Card title="Buyer journey (emails and website)"><Journey contactId={lead.contact_id} visitorId={lead.visitor_id} /></Card>
    </div>
  )
}

export function ScoreBadge({ l }: { l: Lead }) {
  const s = leadScore(l)
  return <span title={s.reasons.join('\n')} className={'inline-grid size-8 place-items-center rounded-full text-[12.5px] font-bold ' + (s.grade === 'A' ? 'bg-[#dcfce7] text-[#166534]' : s.grade === 'B' ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-muted text-muted-foreground')}>{s.score}</span>
}

type Analysis = { summary: string; intent: 'high' | 'medium' | 'low'; signals: string[]; risks: string[]; next_step: string; care_team_note: string }

function handover(l: Lead) {
  const items = (l.items ?? []).map((i: any) => `${i.style}${i.qty ? ` x ${i.qty}` : ''}`).join(', ') || l.requirement || '—'
  return `New buyer ${l.reference}: ${l.company !== '-' ? l.company : l.name} (${l.name}), ${l.country}${l.port ? `, port ${l.port}` : ''}. Wants: ${items}. Contact: ${l.email}${l.phone ? `, ${l.phone}` : ''}. Stage: ${l.stage}.`
}

function SmartBox({ lead }: { lead: Lead }) {
  const s = leadScore(lead)
  const n = nextAction(lead)
  const [res, setRes] = useState<Analysis | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const note = res?.care_team_note || handover(lead)
  async function analyse() {
    setBusy(true); setErr('')
    try { setRes(await ai<Analysis>('buyer_analysis', { leadId: lead.id })) } catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <section className="rounded-xl border border-brand/25 bg-gradient-to-br from-brand-soft to-card p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className={'grid size-16 flex-none place-items-center rounded-2xl text-center font-display ' + (s.grade === 'A' ? 'bg-[#dcfce7] text-[#166534]' : s.grade === 'B' ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-muted')}>
          <span><b className="block text-2xl leading-none">{s.score}</b><span className="text-[11px] font-semibold">FIT {s.grade}</span></span>
        </div>
        <div className="min-w-0 flex-1">
          <p className={'m-0 flex items-start gap-1.5 text-[14px] font-semibold ' + (n.urgent ? 'text-[#b45309]' : '')}><Lightbulb className="mt-0.5 size-4 flex-none" />Next best action: {n.text}</p>
          <ul className="m-0 mt-2 flex flex-wrap gap-1.5 p-0">{s.reasons.map((r) => <li key={r} className="list-none rounded-full bg-card px-2.5 py-0.5 text-[12px] text-muted-foreground">{r}</li>)}</ul>
        </div>
      </div>
      {res && (
        <div className="mt-4 grid gap-3 border-t border-brand/15 pt-4 text-[13.5px]">
          <p className="m-0"><Badge tone={res.intent === 'high' ? 'good' : res.intent === 'medium' ? 'warn' : 'neutral'}>{res.intent} intent</Badge> <span className="ml-1">{res.summary}</span></p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><b className="text-[12.5px] text-brand uppercase">Buying signals</b><ul className="m-0 mt-1 grid gap-1 pl-4">{res.signals.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><b className="text-[12.5px] text-[#b45309] uppercase">Watch out</b><ul className="m-0 mt-1 grid gap-1 pl-4">{res.risks.length ? res.risks.map((x) => <li key={x}>{x}</li>) : <li>No risk flags</li>}</ul></div>
          </div>
          <p className="m-0 font-semibold">Recommended: {res.next_step}</p>
        </div>
      )}
      {err && <p className="mt-3 mb-0 text-[13px] text-[#991b1b]">{err}</p>}
      <div className="mt-4 rounded-lg bg-card p-3 text-[13px]">
        <b className="text-[12px] text-muted-foreground uppercase">Hand-over note for the care team</b>
        <p className="m-0 mt-1">{note}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={analyse} disabled={busy} className={cn(btn, 'btn-primary')}><Sparkles className="size-4" />{busy ? 'Analysing…' : res ? 'Analyse again' : 'AI buyer analysis'}</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(note)}`} target="_blank" rel="noreferrer" className={cn(btn, 'btn-outline')}><MessageCircle className="size-4" />Send to care team</a>
        <button type="button" onClick={() => navigator.clipboard.writeText(note)} className={cn(btn, 'btn-outline')}><Copy className="size-4" />Copy</button>
      </div>
    </section>
  )
}
