import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Copy, Plus, Repeat, Send, Sparkles, TestTube2 } from 'lucide-react'
import { bestSendHour, subjectCheck } from './smart'
import { cn } from '@/lib/utils'
import type { PageProps } from './AdminApp'
import { ai, countBy, fetchAll, fmtTime, FN_URL, pct, sb, type Campaign, type WebEvent } from './client'
import { INTERESTS } from './Contacts'
import { buildEmail, TEMPLATES } from './templates'
import { Badge, Bars, btn, Card, Empty, ErrorNote, Field, input, Kpi, Loading, useAsync } from './ui'

type Stats = { sent: number; failed: number; queued: number; opened: number; clicked: number }

async function loadList() {
  const camps = (await sb().from('bde_campaigns').select('*').order('created_at', { ascending: false })).data as Campaign[]
  const sends = await fetchAll<{ campaign_id: number; status: string; open_count: number; click_count: number }>((a, b) => sb().from('bde_sends').select('campaign_id, status, open_count, click_count').range(a, b), 100000)
  const stats = new Map<number, Stats>()
  for (const s of sends) {
    const t = stats.get(s.campaign_id) ?? { sent: 0, failed: 0, queued: 0, opened: 0, clicked: 0 }
    if (s.status === 'sent') t.sent++; else if (s.status === 'failed') t.failed++; else if (s.status === 'queued') t.queued++
    if (s.open_count) t.opened++; if (s.click_count) t.clicked++
    stats.set(s.campaign_id, t)
  }
  const settings = (await sb().from('bde_settings').select('value').eq('key', 'email').maybeSingle()).data?.value ?? {}
  return { camps: camps ?? [], stats, settings: settings as Record<string, any> }
}

export function Campaigns({ me }: PageProps) {
  const { data, error, loading, reload } = useAsync(loadList, [])
  const [open, setOpen] = useState<Campaign | 'new' | null>(null)
  if (loading && !data) return <Loading />
  if (error) return <ErrorNote error={error} />
  const { camps, stats, settings } = data!
  if (open) return <Editor camp={open === 'new' ? null : open} me={me} settings={settings} onBack={() => { setOpen(null); reload() }} />
  return (
    <div className="grid gap-4">
      {!settings.connected && (
        <div className="rounded-xl border border-[#f59e0b]/40 bg-[#fef3c7] px-5 py-4 text-[14px] text-[#78350f]">
          <b>Sending is not connected yet.</b> You can import contacts and write campaigns now. Sending switches on once the BengalExport domain is bought and the email service is connected in Team &amp; settings.
        </div>
      )}
      <div className="flex justify-end"><button type="button" onClick={() => setOpen('new')} className={cn(btn, 'btn-primary')}><Plus className="size-4" />New campaign</button></div>
      {!camps.length ? <Empty title="No campaigns yet">Start from a ready template: introduction to new buyers, a garments offer, or fresh produce this season.</Empty> : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-[13.5px]">
            <thead><tr className="border-b border-border bg-muted/60 text-left text-[12px] text-muted-foreground uppercase">{['Campaign', 'Status', 'Sent', 'Opened', 'Clicked', 'Created'].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {camps.map((c) => {
                const s = stats.get(c.id) ?? { sent: 0, failed: 0, queued: 0, opened: 0, clicked: 0 }
                return (
                  <tr key={c.id} onClick={() => setOpen(c)} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-3 py-2.5"><b>{c.name}</b><span className="block max-w-md truncate text-[12px] text-muted-foreground">{c.subject}</span></td>
                    <td className="px-3 py-2.5"><Badge tone={c.status === 'sent' ? 'good' : c.status === 'sending' ? 'warn' : 'neutral'}>{c.status}</Badge></td>
                    <td className="num px-3 py-2.5">{s.sent}{s.queued ? <span className="text-muted-foreground"> (+{s.queued} queued)</span> : ''}</td>
                    <td className="num px-3 py-2.5">{pct(s.opened, s.sent)}</td>
                    <td className="num px-3 py-2.5">{pct(s.clicked, s.sent)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{fmtTime(c.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Editor({ camp, me, settings, onBack }: { camp: Campaign | null; me: string; settings: Record<string, any>; onBack: () => void }) {
  const [c, setC] = useState<Partial<Campaign>>(camp ?? { name: TEMPLATES[0].name, subject: TEMPLATES[0].subject, body_html: TEMPLATES[0].html, from_name: 'BengalExport', audience: {}, status: 'draft' })
  const [tab, setTab] = useState<'write' | 'report'>(camp && camp.status !== 'draft' ? 'report' : 'write')
  const [audienceCount, setAudienceCount] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const a = (c.audience ?? {}) as Record<string, any>
  const locked = !!camp && camp.status !== 'draft'

  useEffect(() => {
    if (a.unopenedOf) { sb().from('bde_sends').select('id', { count: 'exact', head: true }).eq('campaign_id', a.unopenedOf).eq('status', 'sent').eq('open_count', 0).then((r) => setAudienceCount(r.count ?? 0)); return }
    let q = sb().from('bde_contacts').select('id', { count: 'exact', head: true }).eq('status', 'subscribed')
    if (a.tags?.length) q = q.overlaps('tags', a.tags)
    if (a.interests?.length) q = q.overlaps('interests', a.interests)
    if (a.countries?.length) q = q.in('country', a.countries)
    if (a.minScore) q = q.gte('score', a.minScore)
    q.then((r) => setAudienceCount(r.count ?? 0))
  }, [JSON.stringify(a)])

  async function save(): Promise<Campaign | null> {
    const row = { name: c.name, subject: c.subject, preheader: c.preheader, from_name: c.from_name, body_html: c.body_html, audience: c.audience, created_by: c.created_by ?? me }
    const r = c.id ? await sb().from('bde_campaigns').update(row).eq('id', c.id).select().single() : await sb().from('bde_campaigns').insert(row).select().single()
    if (r.error) { setMsg(r.error.message); return null }
    setC(r.data); setMsg('Saved.'); return r.data as Campaign
  }

  async function call(body: Record<string, unknown>) {
    const { data } = await sb().auth.getSession()
    const r = await fetch(`${FN_URL}/send`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token}`, apikey: import.meta.env.VITE_SUPABASE_KEY as string }, body: JSON.stringify(body) })
    const j = await r.json(); if (!r.ok) throw new Error(j.error ?? 'Sending failed'); return j
  }
  async function test() {
    setBusy(true); setMsg('')
    try { const s = await save(); if (s) { await call({ campaignId: s.id, testEmail: me }); setMsg(`Test sent to ${me}.`) } } catch (e) { setMsg((e as Error).message) } finally { setBusy(false) }
  }
  async function sendAll() {
    if (!confirm(`Send "${c.subject}" to ${audienceCount} contacts? This cannot be undone.`)) return
    setBusy(true); setMsg('')
    try {
      const s = await save(); if (!s) return
      let total = 0
      for (;;) {
        const r = await call({ campaignId: s.id }); total += r.sent
        setMsg(`Sent ${total}… ${r.remaining} remaining`)
        if (!r.remaining) { setMsg(`Done. Sent ${total} emails.`); break }
        if (!r.dailyRoomLeft) { setMsg(`Sent ${total} today. Daily limit reached; ${r.remaining} will continue when you press Send again tomorrow.`); break }
      }
    } catch (e) { setMsg((e as Error).message) } finally { setBusy(false) }
  }

  const preview = useMemo(() => (c.body_html ?? '').replace(/\{\{\s*first_name\s*\}\}/g, 'Anna').replace(/\{\{\s*name\s*\}\}/g, 'Anna Weber').replace(/\{\{\s*company\s*\}\}/g, 'Weber Textil GmbH').replace(/\{\{\s*country\s*\}\}/g, 'Germany'), [c.body_html])
  const toggle = (key: string, v: string) => { const cur: string[] = a[key] ?? []; setC({ ...c, audience: { ...a, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] } }) }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onBack} className={cn(btn, 'btn-outline')}><ArrowLeft className="size-4" />All campaigns</button>
        {camp && (<div className="flex rounded-lg border border-border bg-card p-0.5 text-[13px]">{(['write', 'report'] as const).map((t) => <button key={t} type="button" onClick={() => setTab(t)} className={cn('rounded-md px-3 py-1.5 font-medium', tab === t && 'bg-brand text-white')}>{t === 'write' ? 'Email' : 'Results'}</button>)}</div>)}
        {locked && <button type="button" onClick={async () => { const r = await sb().from('bde_campaigns').insert({ name: `${c.name} (copy)`, subject: c.subject, preheader: c.preheader, from_name: c.from_name, body_html: c.body_html, audience: c.audience, created_by: me }).select().single(); if (r.data) { setC(r.data); setTab('write') } }} className={cn(btn, 'btn-outline ml-auto')}><Copy className="size-4" />Duplicate</button>}
      </div>
      {tab === 'report' && camp ? <Report camp={camp} onResend={async () => { const r = await sb().from('bde_campaigns').insert({ name: `${c.name} — resend to non-openers`, subject: c.subject, preheader: c.preheader, from_name: c.from_name, body_html: c.body_html, audience: { unopenedOf: camp.id }, created_by: me }).select().single(); if (r.data) { setC(r.data); setTab('write') } }} /> : (
        <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
          <div className="grid content-start gap-4">
            {!camp && (
              <Card title="Start from a template">
                <div className="grid gap-2 sm:grid-cols-2">{TEMPLATES.map((t) => <button key={t.id} type="button" onClick={() => setC({ ...c, name: t.name, subject: t.subject, body_html: t.html })} className="rounded-lg border border-border p-3 text-left text-[13.5px] hover:border-brand"><b>{t.name}</b></button>)}</div>
              </Card>
            )}
            {!locked && <AiWriter onApply={(subject, html) => setC({ ...c, subject, body_html: html })} />}
            <Card title="Email">
              <div className="grid gap-3">
                <Field label="Campaign name (internal)"><input disabled={locked} className={input} value={c.name ?? ''} onChange={(e) => setC({ ...c, name: e.target.value })} /></Field>
                <Field label="Subject line" hint="Use {{first_name}}, {{company}} or {{country}} to personalise."><input disabled={locked} className={input} value={c.subject ?? ''} onChange={(e) => setC({ ...c, subject: e.target.value })} /></Field>
                <SubjectMeter subject={c.subject ?? ''} />
                <Field label="Sender name"><input disabled={locked} className={input} value={c.from_name ?? ''} onChange={(e) => setC({ ...c, from_name: e.target.value })} /></Field>
                <Field label="Email body (HTML)" hint="Links to the BengalExport website are tracked automatically, so you see which product each buyer clicks and what they do on the site."><textarea disabled={locked} className={cn(input, 'min-h-[260px] font-mono text-[12px]')} value={c.body_html ?? ''} onChange={(e) => setC({ ...c, body_html: e.target.value })} /></Field>
              </div>
            </Card>
            <Card title={`Audience: ${audienceCount ?? '…'} subscribed contacts`}>
              <div className="grid gap-3">
                {!locked && (
                  <div className="flex flex-wrap gap-1.5">
                    {([['Everyone', {}], ['Hot (score 20+)', { minScore: 20 }], ['Website leads', { tags: ['lead'] }], ['Engaged (score 5+)', { minScore: 5 }]] as [string, Record<string, unknown>][]).map(([label, aud]) => (
                      <button key={label} type="button" onClick={() => setC({ ...c, audience: aud })} className="rounded-lg border border-dashed border-brand/50 px-2.5 py-1 text-[12.5px] font-medium text-brand hover:bg-brand-soft"><Sparkles className="mr-1 inline size-3" />{label}</button>
                    ))}
                  </div>
                )}
                {a.unopenedOf && <p className="m-0 rounded-lg bg-brand-soft px-3 py-2 text-[13px] text-brand">Sending only to people who did not open campaign #{a.unopenedOf}.</p>}
                <div><div className="mb-1.5 text-[13px] font-semibold">Interested in</div><div className="flex flex-wrap gap-1.5">{INTERESTS.map((i) => <button key={i} type="button" disabled={locked} onClick={() => toggle('interests', i)} className={cn('rounded-full border px-2.5 py-1 text-[12.5px]', (a.interests ?? []).includes(i) ? 'border-brand bg-brand-soft text-brand' : 'border-border')}>{i}</button>)}</div></div>
                <Field label="Tags (comma separated)"><input disabled={locked} className={input} value={(a.tags ?? []).join(', ')} onChange={(e) => setC({ ...c, audience: { ...a, tags: e.target.value.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) } })} placeholder="lead, importer" /></Field>
                <Field label="Countries (comma separated)"><input disabled={locked} className={input} value={(a.countries ?? []).join(', ')} onChange={(e) => setC({ ...c, audience: { ...a, countries: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) } })} placeholder="Germany, United Kingdom" /></Field>
                <Field label="Only engaged contacts (minimum score)"><input disabled={locked} type="number" min={0} className={input} value={a.minScore ?? 0} onChange={(e) => setC({ ...c, audience: { ...a, minScore: Number(e.target.value) || 0 } })} /></Field>
                <p className="m-0 text-[12.5px] text-muted-foreground">Leave everything empty to send to all subscribed contacts. Unsubscribed and bounced contacts are always skipped.</p>
              </div>
            </Card>
            {!locked && (
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={save} disabled={busy} className={cn(btn, 'btn-outline')}>Save draft</button>
                <button type="button" onClick={test} disabled={busy || !settings.connected} className={cn(btn, 'btn-outline disabled:opacity-50')}><TestTube2 className="size-4" />Send test to me</button>
                <button type="button" onClick={sendAll} disabled={busy || !settings.connected || !audienceCount} className={cn(btn, 'btn-primary disabled:opacity-50')}><Send className="size-4" />Send to {audienceCount ?? 0}</button>
              </div>
            )}
            {camp?.status === 'sending' && <button type="button" onClick={sendAll} disabled={busy} className={cn(btn, 'btn-primary w-fit')}><Send className="size-4" />Continue sending</button>}
            {!settings.connected && <p className="m-0 text-[13px] text-muted-foreground">Sending is switched off until the email service is connected.</p>}
            {msg && <p className="m-0 rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand">{msg}</p>}
          </div>
          <Card title="Preview" className="xl:sticky xl:top-20 xl:self-start">
            <p className="mt-0 mb-2 text-[13px] text-muted-foreground"><b>Subject:</b> {(c.subject ?? '').replace(/\{\{\s*first_name\s*\}\}/g, 'Anna').replace(/\{\{\s*company\s*\}\}/g, 'Weber Textil GmbH').replace(/\{\{\s*country\s*\}\}/g, 'Germany')}</p>
            <iframe title="Email preview" srcDoc={preview} className="h-[640px] w-full rounded-lg border border-border bg-white" sandbox="" />
          </Card>
        </div>
      )}
    </div>
  )
}

function Report({ camp, onResend }: { camp: Campaign; onResend: () => void }) {
  const { data, loading } = useAsync(async () => {
    const sends = await fetchAll<any>((a, b) => sb().from('bde_sends').select('id, status, open_count, click_count, first_open_at, contact_id, error, bde_contacts(email, company, name, country)').eq('campaign_id', camp.id).range(a, b), 100000)
    const ev = await fetchAll<any>((a, b) => sb().from('bde_email_events').select('kind, url, created_at, contact_id').eq('campaign_id', camp.id).range(a, b), 100000)
    const web = await fetchAll<WebEvent>((a, b) => sb().from('bde_web_events').select('*').eq('campaign_id', camp.id).range(a, b), 50000)
    const ids = [...new Set(sends.map((s: any) => s.contact_id))]
    const leads = ids.length ? (await sb().from('bde_leads').select('id, contact_id, created_at, company, country').in('contact_id', ids.slice(0, 1000)).gte('created_at', camp.sent_at ?? camp.created_at)).data ?? [] : []
    return { sends, ev, web, leads }
  }, [camp.id])
  if (loading || !data) return <Loading />
  const { sends, ev, web, leads } = data
  const sent = sends.filter((s: any) => s.status === 'sent')
  const opened = sent.filter((s: any) => s.open_count > 0)
  const clicked = sent.filter((s: any) => s.click_count > 0)
  const unsub = ev.filter((e: any) => e.kind === 'unsubscribe').length
  const links = countBy(ev.filter((e: any) => e.kind === 'click'), (e: any) => String(e.url).replace(/^https?:\/\/[^/]+/, '').split('?')[0] || '/')
  const hours = countBy(opened, (s: any) => s.first_open_at && `${new Date(s.first_open_at).getHours()}:00`)
  const engaged = [...sent].sort((x: any, y: any) => y.click_count * 5 + y.open_count - (x.click_count * 5 + x.open_count)).slice(0, 12)
  const best = bestSendHour(sent)
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand/25 bg-brand-soft/60 px-4 py-3 text-[13.5px]">
        <Sparkles className="size-4 text-brand" />
        <span className="flex-1">{sent.length - opened.length > 0 ? `${sent.length - opened.length} people have not opened yet. Resending to them with a new subject line usually adds another third to your opens.` : 'Everyone opened this campaign.'}{best !== null && ` Best open time: around ${best}:00 Bangladesh time.`}</span>
        {sent.length - opened.length > 0 && <button type="button" onClick={onResend} className={cn(btn, 'btn-primary')}><Repeat className="size-4" />Resend to non-openers</button>}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Sent" value={sent.length} sub={`${sends.filter((s: any) => s.status === 'failed').length} failed · ${sends.filter((s: any) => s.status === 'queued').length} queued`} />
        <Kpi label="Opened" value={pct(opened.length, sent.length)} sub={`${opened.length} people`} tone="good" />
        <Kpi label="Clicked" value={pct(clicked.length, sent.length)} sub={`${clicked.length} people`} tone="good" />
        <Kpi label="Visited the website" value={new Set(web.map((w) => w.visitor_id)).size} sub={`${web.filter((w) => w.kind === 'product_view').length} product views`} />
        <Kpi label="Quote requests after" value={leads.length} sub="from people in this campaign" tone={leads.length ? 'good' : undefined} />
        <Kpi label="Unsubscribed" value={unsub} sub={pct(unsub, sent.length)} tone={unsub / Math.max(1, sent.length) > 0.01 ? 'warn' : undefined} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Click map: which links buyers clicked"><Bars rows={links} max={12} empty="No clicks yet." /></Card>
        <Card title="Products they viewed on the website"><Bars rows={countBy(web.filter((w) => w.kind === 'product_view'), (w) => w.product?.replace(/-/g, ' '))} empty="No website visits yet." /></Card>
        <Card title="Most engaged recipients">
          <ul className="m-0 grid list-none gap-2 p-0 text-[13.5px]">
            {engaged.filter((s: any) => s.open_count).map((s: any) => <li key={s.id} className="flex justify-between gap-3"><span className="truncate"><b>{s.bde_contacts?.company || s.bde_contacts?.name || s.bde_contacts?.email}</b> <span className="text-muted-foreground">{s.bde_contacts?.country}</span></span><span className="whitespace-nowrap">{s.open_count} opens · {s.click_count} clicks</span></li>)}
            {!opened.length && <li className="text-muted-foreground">No opens yet.</li>}
          </ul>
        </Card>
        <Card title="When people opened (hour of day)"><Bars rows={hours} max={10} empty="No opens yet." /></Card>
      </div>
      {!!sends.filter((s: any) => s.error).length && <Card title="Delivery problems"><ul className="m-0 grid gap-1 p-0 pl-4 text-[13px]">{sends.filter((s: any) => s.error).slice(0, 20).map((s: any) => <li key={s.id}>{s.bde_contacts?.email}: {s.error}</li>)}</ul></Card>}
      <p className="m-0 text-[12.5px] text-muted-foreground">Opens are counted when the email's images load, so they are an estimate (some email apps block or pre-load images). Clicks and website visits are exact.</p>
    </div>
  )
}

function SubjectMeter({ subject }: { subject: string }) {
  if (!subject) return null
  const r = subjectCheck(subject)
  return (
    <div className="-mt-1 flex items-start gap-2 text-[12.5px]">
      <span className={'num rounded-full px-2 py-0.5 font-bold ' + (r.score >= 80 ? 'bg-[#dcfce7] text-[#166534]' : r.score >= 60 ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#fee2e2] text-[#991b1b]')}>{r.score}</span>
      <span className="text-muted-foreground">{r.tips.join(' ')}</span>
    </div>
  )
}

const PRODUCT_KEYS: Record<string, string> = { garments: 'tshirt-crew', 'home-textiles': 'bath-towels', jute: 'jute-tote', footwear: 'leather-sandals', produce: 'mango', food: 'turmeric-powder', crafts: 'nakshi-kantha' }

function AiWriter({ onApply }: { onApply: (subject: string, html: string) => void }) {
  const [brief, setBrief] = useState('')
  const [cats, setCats] = useState<string[]>(['garments', 'home-textiles', 'jute'])
  const [res, setRes] = useState<{ subjects: string[]; intro: string; products: { title: string; line: string }[]; closing: string; button: string } | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function go() {
    setBusy(true); setErr('')
    try { setRes(await ai('campaign_write', { brief: `${brief}. Feature these categories: ${cats.join(', ')}` })) } catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <Card title={<span className="flex items-center gap-2"><Sparkles className="size-4 text-brand" />Write with AI</span>} className="border-brand/30">
      <div className="grid gap-3">
        <textarea className={cn(input, 'min-h-[70px]')} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="e.g. Winter promotion for UK and German importers: fleece hoodies and bath towels, samples in 24 hours" />
        <div className="flex flex-wrap gap-1.5">{Object.keys(PRODUCT_KEYS).map((k) => <button key={k} type="button" onClick={() => setCats(cats.includes(k) ? cats.filter((x) => x !== k) : [...cats, k].slice(-3))} className={cn('rounded-full border px-2.5 py-1 text-[12.5px]', cats.includes(k) ? 'border-brand bg-brand-soft text-brand' : 'border-border')}>{k}</button>)}</div>
        <button type="button" onClick={go} disabled={busy || brief.length < 8} className={cn(btn, 'btn-primary w-fit disabled:opacity-50')}><Sparkles className="size-4" />{busy ? 'Writing…' : 'Write the email'}</button>
        {err && <p className="m-0 text-[13px] text-[#991b1b]">{err}</p>}
        {res && (
          <div className="grid gap-2">
            <p className="m-0 text-[13px] font-semibold">Pick a subject line to use this email:</p>
            {res.subjects.map((s) => (
              <button key={s} type="button" onClick={() => onApply(s, buildEmail(res.intro, res.products.map((p, i) => ({ ...p, key: PRODUCT_KEYS[cats[i] ?? 'garments'] ?? 'tshirt-crew', cat: cats[i] ?? 'garments' })), res.closing, res.button))} className="rounded-lg border border-border bg-card px-3 py-2 text-left text-[13.5px] hover:border-brand">{s}</button>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
