import { useState } from 'react'
import { Bot, CheckCircle2, Circle, Copy, ExternalLink, Globe2, Inbox, Linkedin, Mail, MousePointerClick, Megaphone, Play, Search, Send, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sb, ago, fmtTime, pct } from './client'
import { Badge, Card, Drawer, Empty, ErrorNote, Field, Kpi, Loading, btn, input, useAsync } from './ui'

const AP_URL = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/bde-autopilot`
async function ap<T = any>(route: string): Promise<T> {
  const { data } = await sb().auth.getSession()
  const r = await fetch(`${AP_URL}/${route}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token}`, apikey: import.meta.env.VITE_SUPABASE_KEY as string }, body: '{}' })
  const j = await r.json().catch(() => ({ error: 'The autopilot did not respond' }))
  if (!r.ok || j.error) throw new Error(j.error ?? 'Request failed')
  return j as T
}

const COUNTRIES = ['United Kingdom', 'Netherlands', 'France', 'Spain', 'Italy', 'Poland', 'Belgium', 'Denmark', 'Sweden', 'Ireland', 'Germany', 'Austria', 'Canada', 'United States', 'Australia', 'Japan', 'Malaysia', 'Singapore', 'Saudi Arabia']
const PRODUCTS: [string, string][] = [['garments', 'Garments'], ['footwear', 'Footwear & leather'], ['home', 'Home textiles'], ['jute', 'Jute'], ['produce', 'Fresh produce'], ['food', 'Food & spices'], ['crafts', 'Handicrafts']]
const REPLY_TONE: Record<string, 'good' | 'info' | 'warn' | 'bad' | 'neutral'> = { interested: 'good', question: 'info', not_now: 'warn', not_interested: 'bad', unsubscribe: 'bad', bounced: 'bad' }

export function Autopilot({ owner }: { owner: boolean }) {
  const status = useAsync(() => ap<any>('status').catch((e) => ({ error: String(e.message) })), [])
  const cfg = useAsync(async () => (await sb().from('bde_settings').select('value').eq('key', 'autopilot').maybeSingle()).data?.value ?? {}, [])
  const data = useAsync(async () => {
    const [pros, out, logs, tasks] = await Promise.all([
      sb().from('bde_contacts').select('id, email, company, country, website, status, score, seq_step, next_touch_at, last_touch_at, replied_at, last_click_at, tags, research, created_at').contains('tags', ['prospect']).order('created_at', { ascending: false }).limit(1000),
      sb().from('bde_outreach').select('id, created_at, contact_id, step, subject, status, error').order('created_at', { ascending: false }).limit(2000),
      sb().from('bde_autopilot_log').select('*').order('created_at', { ascending: false }).limit(30),
      sb().from('bde_tasks').select('*').order('created_at', { ascending: false }).limit(300),
    ])
    return { pros: pros.data ?? [], out: out.data ?? [], logs: logs.data ?? [], tasks: tasks.data ?? [] }
  }, [])
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')
  const [preview, setPreview] = useState<any>(null)
  const [open, setOpen] = useState<any>(null)

  async function run(route: string) {
    setBusy(route); setErr('')
    try { const r = await ap(route); if (route === 'preview') setPreview(r); data.reload(); status.reload() } catch (e) { setErr((e as Error).message) } finally { setBusy('') }
  }
  async function save(next: Record<string, any>) {
    await sb().from('bde_settings').upsert({ key: 'autopilot', value: next, updated_at: new Date().toISOString() })
    cfg.reload(); status.reload()
  }

  if (status.loading || cfg.loading || data.loading) return <Loading />
  const s = status.data ?? {}
  const c = (cfg.data ?? {}) as Record<string, any>
  const { pros, out, logs, tasks } = data.data!
  const sent = out.filter((o) => o.status === 'sent')
  const week = Date.now() - 7 * 864e5
  const replied = pros.filter((p) => p.replied_at)
  const positive = pros.filter((p) => (p.tags ?? []).some((t: string) => t === 'reply:interested' || t === 'reply:question'))
  const clicked = pros.filter((p) => p.last_click_at)
  const contacted = pros.filter((p) => p.seq_step > 0)
  const ready = s.ai && s.mailbox
  const report = logs.find((l) => l.kind === 'daily_report')?.summary as any
  const research = logs.filter((l) => l.kind === 'research')

  return (
    <div className="grid gap-5">
      <section className={cn('rounded-xl border p-5', c.enabled && ready ? 'border-brand/30 bg-brand-soft/50' : 'border-border bg-card')}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="m-0 flex items-center gap-2 text-lg"><Bot className="size-5 text-brand" />Sales autopilot {c.enabled && ready ? <Badge tone="good">Running</Badge> : c.enabled ? <Badge tone="warn">Waiting for setup</Badge> : <Badge>Off</Badge>}</h2>
            <p className="mt-1.5 mb-0 text-[14px] text-muted-foreground">Every day it picks the best market and product, finds real importers and wholesalers there, writes each one a personal email, follows up twice, reads the replies in the morning, and hands interested buyers to the care team. You get one report email each morning.</p>
          </div>
          {owner && (
            <button type="button" role="switch" aria-checked={!!c.enabled} onClick={() => save({ ...c, enabled: !c.enabled })} className={cn(btn, c.enabled ? 'btn-outline' : 'btn-primary')}>
              <Play className="size-4" />{c.enabled ? 'Pause autopilot' : 'Turn on autopilot'}
            </button>
          )}
        </div>
        <ul className="m-0 mt-4 grid list-none gap-2 p-0 text-[13.5px] sm:grid-cols-3">
          <Check ok={!!s.ai} label="AI connected" hint={s.ai ? `Using ${s.ai_provider}` : 'Needed to find buyers and write emails'} />
          <Check ok={!!s.mailbox} label="Sales mailbox connected" hint={s.mailbox ? s.mailbox_address : 'A mailbox on your domain, e.g. sales@'} />
          <Check ok={!!(c.report_email)} label="Morning report address" hint={c.report_email || 'Where the daily report goes'} />
        </ul>
      </section>

      <ErrorNote error={err || (status.data as any)?.error} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi label="Buyers found" value={pros.length} sub={`${pros.filter((p) => new Date(p.created_at).getTime() > week).length} this week`} />
        <Kpi label="Emails sent" value={sent.length} sub={`${sent.filter((o) => new Date(o.created_at).getTime() > week).length} this week`} />
        <Kpi label="Contacted" value={contacted.length} sub={`${pros.filter((p) => p.seq_step > 0 && p.seq_step < 3 && !p.replied_at).length} in follow-up`} />
        <Kpi label="Replies" value={replied.length} sub={`${pct(replied.length, contacted.length)} reply rate`} tone={replied.length ? 'good' : undefined} />
        <Kpi label="Interested buyers" value={positive.length} sub="sent to Quote requests" tone={positive.length ? 'good' : undefined} />
        <Kpi label="Visited the website" value={clicked.length} sub={pct(clicked.length, contacted.length)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title={<span className="flex items-center gap-2"><Target className="size-4 text-brand" />Today's focus</span>} className="lg:col-span-2">
          {(s.plan ?? []).length ? (
            <ul className="m-0 grid list-none gap-3 p-0">
              {(s.plan as any[]).map((t) => (
                <li key={t.fam + t.country} className="rounded-lg border border-border p-3">
                  <b className="first-letter:uppercase">{t.label}</b> → <b>{t.country}</b>
                  <div className="mt-1 text-[12.5px] text-muted-foreground">Buyers: {t.buyers}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">{t.why.map((w: string) => <Badge key={w} tone="info">{w}</Badge>)}</div>
                </li>
              ))}
            </ul>
          ) : <p className="m-0 text-sm text-muted-foreground">No markets match your settings.</p>}
          <p className="mt-3 mb-0 text-[12.5px] text-muted-foreground">Chosen from 0% duty markets, what visitors look at on the website, quote requests and the reply rate of earlier emails. It keeps testing new markets and moves towards the ones that answer. Sending limit today: <b>{s.cap_today}</b> emails (it grows slowly while the mailbox builds trust), only in each buyer's business hours, Monday to Friday.</p>
          {owner && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={!!busy || !s.ai} onClick={() => run('preview')} className={cn(btn, 'btn-outline')}><Search className="size-4" />{busy === 'preview' ? 'Searching… (about 1 minute)' : 'Preview: find 3 buyers now'}</button>
              <button type="button" disabled={!!busy || !s.ai} onClick={() => run('research')} className={cn(btn, 'btn-outline')}><Globe2 className="size-4" />{busy === 'research' ? 'Finding buyers…' : 'Find today’s buyers now'}</button>
              <button type="button" disabled={!!busy || !s.mailbox} onClick={() => run('send')} className={cn(btn, 'btn-outline')}><Send className="size-4" />{busy === 'send' ? 'Sending…' : 'Send next 10 now'}</button>
              <button type="button" disabled={!!busy || !s.ai} onClick={() => run('channels')} className={cn(btn, 'btn-outline')}><Megaphone className="size-4" />{busy === 'channels' ? 'Searching… (about 1 minute)' : 'Find buying requests now'}</button>
              <button type="button" disabled={!!busy} onClick={() => run('morning')} className={cn(btn, 'btn-outline')}><Inbox className="size-4" />{busy === 'morning' ? 'Checking…' : 'Check replies now'}</button>
            </div>
          )}
        </Card>

        <Card title={<span className="flex items-center gap-2"><Mail className="size-4 text-brand" />Last morning report</span>}>
          {report ? (
            <div className="grid gap-2 text-[13.5px]">
              <p className="m-0 text-muted-foreground">{fmtTime(logs.find((l) => l.kind === 'daily_report')?.created_at)}</p>
              <p className="m-0">Sent <b>{report.sent}</b> · found <b>{report.found}</b> · in follow-up <b>{report.in_sequence}</b></p>
              {(report.replies ?? []).length ? (report.replies as any[]).map((r, i) => <p key={i} className="m-0"><Badge tone={REPLY_TONE[r.label] ?? 'neutral'}>{String(r.label ?? '').replace('_', ' ')}</Badge> <b>{r.company ?? r.email}</b>{r.summary ? `: ${r.summary}` : ''}</p>) : <p className="m-0 text-muted-foreground">No replies in that report.</p>}
              {(report.clicks ?? []).map((k: any, i: number) => <p key={'k' + i} className="m-0"><MousePointerClick className="inline size-3.5 text-brand" /> <b>{k.company}</b> visited {k.pages.join(', ')}</p>)}
              {report.reply_error && <p className="m-0 text-[12.5px] text-[#92400e]">Inbox: {report.reply_error}</p>}
            </div>
          ) : <p className="m-0 text-sm text-muted-foreground">The first report arrives the morning after the autopilot starts (9:00 Bangladesh time).</p>}
        </Card>
      </div>

      <TaskList tasks={tasks} onChanged={data.reload} />

      {preview && (
        <Card title="Preview (nothing was saved or sent)" action={<button type="button" className="text-[13px] text-muted-foreground" onClick={() => setPreview(null)}>Close</button>}>
          <p className="mt-0 text-[14px]">Searched for <b>{preview.target?.label}</b> buyers in <b>{preview.target?.country}</b>. Found {preview.found?.length ?? 0} with a public company email:</p>
          <ul className="m-0 grid list-none gap-2 p-0 text-[13.5px]">{(preview.found ?? []).map((f: any) => <li key={f.email} className="rounded-lg border border-border p-3"><b>{f.company}</b> · {f.website} · {f.email}<div className="text-muted-foreground">{f.research?.why}</div></li>)}</ul>
          {preview.sample && <div className="mt-4 rounded-lg bg-muted p-4 text-[13.5px]"><p className="m-0 font-semibold">Subject: {preview.sample.subject}</p><pre className="m-0 mt-2 font-sans whitespace-pre-wrap">{preview.sample.body}</pre></div>}
        </Card>
      )}

      <Card title="Buyers the autopilot found">
        {pros.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13.5px]">
              <thead className="text-[12px] text-muted-foreground uppercase"><tr><th className="py-2 pr-3">Company</th><th className="pr-3">Country</th><th className="pr-3">Product</th><th className="pr-3">Progress</th><th className="pr-3">Last email</th><th>Status</th></tr></thead>
              <tbody>
                {pros.slice(0, 300).map((p) => {
                  const reply = (p.tags ?? []).find((t: string) => t.startsWith('reply:'))?.slice(6)
                  return (
                    <tr key={p.id} className="cursor-pointer border-t border-border hover:bg-muted/50" onClick={() => setOpen(p)}>
                      <td className="py-2 pr-3"><b>{p.company}</b><div className="text-[12px] text-muted-foreground">{p.email}</div></td>
                      <td className="pr-3">{p.country}</td>
                      <td className="pr-3 first-letter:uppercase">{p.research?.label ?? '—'}</td>
                      <td className="pr-3">{p.seq_step === 0 ? 'Waiting' : `Email ${p.seq_step} of 3`}</td>
                      <td className="pr-3">{p.last_touch_at ? ago(p.last_touch_at) : '—'}</td>
                      <td>{p.status !== 'subscribed' ? <Badge tone="bad">{p.status}</Badge> : reply ? <Badge tone={REPLY_TONE[reply] ?? 'neutral'}>{reply.replace('_', ' ')}</Badge> : p.last_click_at ? <Badge tone="good">Visited site</Badge> : p.seq_step >= 3 ? <Badge>Finished</Badge> : <Badge tone="info">Active</Badge>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty title="No buyers yet">Once the AI and the sales mailbox are connected and the autopilot is on, new buyers appear here every morning.</Empty>}
      </Card>

      {research.length > 0 && (
        <Card title="Research log">
          <ul className="m-0 grid list-none gap-2 p-0 text-[13.5px]">{research.slice(0, 7).map((l) => (l.summary.results ?? []).map((r: any, i: number) => <li key={l.id + '-' + i}><span className="text-muted-foreground">{fmtTime(l.created_at)}</span> · <span className="first-letter:uppercase">{r.label}</span> in {r.country}: {r.error ? <span className="text-[#991b1b]">{r.error}</span> : <b>{r.found} found</b>}{r.companies?.length ? ` (${r.companies.slice(0, 4).join(', ')}${r.companies.length > 4 ? '…' : ''})` : ''}</li>))}</ul>
        </Card>
      )}

      {owner && <AutopilotSettings value={c} onSave={save} />}

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.company}>
        {open && <ProspectDetail p={open} emails={out.filter((o) => o.contact_id === open.id)} onChanged={() => { data.reload(); setOpen(null) }} />}
      </Drawer>
    </div>
  )
}

function Check({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
  return (
    <li className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
      {ok ? <CheckCircle2 className="mt-0.5 size-4 flex-none text-brand" /> : <Circle className="mt-0.5 size-4 flex-none text-muted-foreground" />}
      <span><b className="block">{label}</b><span className="text-[12.5px] break-all text-muted-foreground">{hint}</span></span>
    </li>
  )
}

function ProspectDetail({ p, emails, onChanged }: { p: any; emails: any[]; onChanged: () => void }) {
  async function stop() { await sb().from('bde_contacts').update({ next_touch_at: null, seq_step: 3 }).eq('id', p.id); onChanged() }
  return (
    <div className="grid gap-4 text-[14px]">
      <p className="m-0">{p.country} · <a href={p.website} target="_blank" rel="noreferrer" className="text-brand">{p.website}</a> · {p.email}</p>
      {p.research && <p className="m-0 rounded-lg bg-muted p-3"><b className="capitalize">{p.research.type}</b>: {p.research.why}</p>}
      <div>
        <h3 className="m-0 mb-2 text-[14px]">Emails</h3>
        {emails.length ? emails.slice().reverse().map((e) => <div key={e.id} className="mb-2 rounded-lg border border-border p-3"><div className="flex justify-between gap-2 text-[12.5px] text-muted-foreground"><span>Email {e.step + 1} · {fmtTime(e.created_at)}</span>{e.status !== 'sent' && <Badge tone="bad">{e.status}</Badge>}</div><b>{e.subject}</b>{e.error && <p className="m-0 text-[12.5px] text-[#991b1b]">{e.error}</p>}</div>) : <p className="m-0 text-muted-foreground">Not emailed yet.</p>}
      </div>
      {p.seq_step < 3 && !p.replied_at && p.status === 'subscribed' && <button type="button" onClick={stop} className={cn(btn, 'btn-outline justify-self-start')}>Stop emailing this company</button>}
    </div>
  )
}

function AutopilotSettings({ value, onSave }: { value: Record<string, any>; onSave: (v: Record<string, any>) => Promise<void> }) {
  const [v, setV] = useState<Record<string, any>>({ daily_new: 15, daily_cap: 45, skip_countries: [], focus_countries: [], focus_families: [], ...value })
  const [saved, setSaved] = useState(false)
  const toggle = (k: string, x: string) => setV((o) => ({ ...o, [k]: (o[k] ?? []).includes(x) ? o[k].filter((y: string) => y !== x) : [...(o[k] ?? []), x] }))
  return (
    <Card title="Autopilot settings">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Morning report goes to"><input className={input} type="email" value={v.report_email ?? ''} onChange={(e) => setV({ ...v, report_email: e.target.value })} placeholder="you@yourdomain.com" /></Field>
        <Field label="Name the emails come from"><input className={input} value={v.sender_name ?? ''} onChange={(e) => setV({ ...v, sender_name: e.target.value })} placeholder="BengalExport sales team" /></Field>
        <Field label="New buyers to find per day" hint="10–20 is a healthy pace."><input className={input} type="number" min={0} max={40} value={v.daily_new} onChange={(e) => setV({ ...v, daily_new: Number(e.target.value) })} /></Field>
        <Field label="Most emails per day" hint="Includes follow-ups. Stay at 50 or below per mailbox."><input className={input} type="number" min={5} max={80} value={v.daily_cap} onChange={(e) => setV({ ...v, daily_cap: Number(e.target.value) })} /></Field>
      </div>
      <div className="mt-4 grid gap-4">
        <ChipSet label="Only these products (leave empty for all)" all={PRODUCTS} picked={v.focus_families ?? []} onToggle={(x) => toggle('focus_families', x)} />
        <ChipSet label="Only these countries (leave empty for all)" all={COUNTRIES.map((x) => [x, x])} picked={v.focus_countries ?? []} onToggle={(x) => toggle('focus_countries', x)} />
        <ChipSet label="Never email these countries" all={COUNTRIES.map((x) => [x, x])} picked={v.skip_countries ?? []} onToggle={(x) => toggle('skip_countries', x)} hint="Germany and Austria are skipped by default: their law requires permission before a first business email." />
      </div>
      <button type="button" onClick={async () => { await onSave(v); setSaved(true); setTimeout(() => setSaved(false), 2000) }} className={cn(btn, 'btn-primary mt-4')}>{saved ? 'Saved' : 'Save settings'}</button>
    </Card>
  )
}

function ChipSet({ label, all, picked, onToggle, hint }: { label: string; all: [string, string][]; picked: string[]; onToggle: (x: string) => void; hint?: string }) {
  return (
    <div>
      <p className="m-0 mb-2 text-[13.5px] font-semibold">{label}</p>
      <div className="flex flex-wrap gap-1.5">{all.map(([k, l]) => <button key={k} type="button" onClick={() => onToggle(k)} className={cn('rounded-full border px-3 py-1 text-[12.5px]', picked.includes(k) ? 'border-brand bg-brand text-white' : 'border-border bg-card')}>{l}</button>)}</div>
      {hint && <p className="m-0 mt-1.5 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

const KIND: Record<string, [string, typeof Linkedin, 'good' | 'info' | 'warn' | 'neutral']> = { rfq: ['Buying request', Megaphone, 'good'], linkedin: ['LinkedIn', Linkedin, 'info'], contact_form: ['Contact form', Mail, 'warn'], follow_up: ['Follow-up', Send, 'neutral'] }

function TaskList({ tasks, onChanged }: { tasks: any[]; onChanged: () => void }) {
  const [show, setShow] = useState<'open' | 'done'>('open')
  const [copied, setCopied] = useState<number | null>(null)
  const list = tasks.filter((t) => (show === 'open' ? t.status === 'open' : t.status !== 'open'))
  async function mark(t: any, status: 'done' | 'skipped') {
    const { data } = await sb().auth.getUser()
    await sb().from('bde_tasks').update({ status, done_at: new Date().toISOString(), done_by: data.user?.email ?? null }).eq('id', t.id)
    onChanged()
  }
  const open = tasks.filter((t) => t.status === 'open')
  return (
    <Card title={<span className="flex items-center gap-2"><Megaphone className="size-4 text-brand" />Tasks for the care team {open.length > 0 && <Badge tone="warn">{open.length} open</Badge>}</span>} action={<div className="flex gap-1 text-[13px]">{(['open', 'done'] as const).map((k) => <button key={k} type="button" onClick={() => setShow(k)} className={cn('rounded-full px-3 py-1', show === k ? 'bg-brand text-white' : 'bg-muted')}>{k === 'open' ? 'To do' : 'Finished'}</button>)}</div>}>
      <p className="mt-0 mb-4 text-[13px] text-muted-foreground">Channels that must not be automated (LinkedIn, website contact forms, buying-request boards) are prepared here with a ready message. Open the link, paste the message, send, then tick it off. About 15 minutes a day.</p>
      {list.length ? (
        <ul className="m-0 grid list-none gap-3 p-0">
          {list.slice(0, 60).map((t) => {
            const [label, Icon, tone] = KIND[t.kind] ?? ['Task', Send, 'neutral']
            return (
              <li key={t.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0"><span className="mr-2 inline-flex"><Badge tone={tone}><Icon className="mr-1 size-3" />{label}</Badge></span><b className="text-[14.5px]">{t.title}</b><div className="text-[12.5px] text-muted-foreground">{[t.company, t.country, t.details?.quantity, ago(t.created_at)].filter(Boolean).join(' · ')}</div></div>
                  {t.status === 'open' ? (
                    <div className="flex flex-wrap gap-1.5">
                      {t.url && <a href={t.url} target="_blank" rel="noreferrer" className={cn(btn, 'btn-outline !px-2.5 !py-1 text-[13px]')}><ExternalLink className="size-3.5" />Open</a>}
                      {t.message && <button type="button" onClick={async () => { await navigator.clipboard.writeText(t.message); setCopied(t.id); setTimeout(() => setCopied(null), 1500) }} className={cn(btn, 'btn-outline !px-2.5 !py-1 text-[13px]')}><Copy className="size-3.5" />{copied === t.id ? 'Copied' : 'Copy message'}</button>}
                      <button type="button" onClick={() => mark(t, 'done')} className={cn(btn, 'btn-primary !px-2.5 !py-1 text-[13px]')}>Done</button>
                      <button type="button" onClick={() => mark(t, 'skipped')} className="px-2 text-[13px] text-muted-foreground">Skip</button>
                    </div>
                  ) : <Badge>{t.status} {t.done_by ? `by ${t.done_by}` : ''}</Badge>}
                </div>
                {t.message && t.status === 'open' && <pre className="m-0 mt-3 max-h-40 overflow-auto rounded-md bg-muted p-3 font-sans text-[13px] whitespace-pre-wrap">{t.message}</pre>}
              </li>
            )
          })}
        </ul>
      ) : <Empty title={show === 'open' ? 'Nothing to do right now' : 'No finished tasks yet'}>{show === 'open' ? 'New buying requests and LinkedIn tasks appear every morning while the autopilot is on.' : undefined}</Empty>}
    </Card>
  )
}
