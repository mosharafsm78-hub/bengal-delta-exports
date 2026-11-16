import { useEffect, useMemo, useState } from 'react'
import { Inbox as InboxIcon, Mail, RefreshCw, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sb, ago, fmtTime } from './client'
import { Badge, Empty, ErrorNote, Loading, btn, useAsync } from './ui'

const AP_URL = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/bde-autopilot`
async function ap<T = any>(route: string, body: Record<string, unknown> = {}): Promise<T> {
  const { data } = await sb().auth.getSession()
  const r = await fetch(`${AP_URL}/${route}`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session?.access_token}`, apikey: import.meta.env.VITE_SUPABASE_KEY as string }, body: JSON.stringify(body) })
  const j = await r.json().catch(() => ({ error: 'No response' }))
  if (!r.ok || j.error) throw new Error(j.error ?? 'Request failed')
  return j as T
}

type Msg = { id: number; created_at: string; direction: 'in' | 'out'; from_email: string | null; to_email: string | null; subject: string | null; body: string | null; contact_id: number | null; label: string | null; summary: string | null; next_step: string | null; care_note: string | null; handled: boolean }
type Thread = { key: string; email: string; contact: any; msgs: Msg[]; last: Msg; unread: number }
const TONE: Record<string, 'good' | 'info' | 'warn' | 'bad' | 'neutral'> = { interested: 'good', question: 'info', not_now: 'warn', not_interested: 'bad', unsubscribe: 'bad', auto_reply: 'neutral', wrong_person: 'warn' }

/** Every email buyers send to the sales mailbox, threaded with what we sent them. Reply from here. */
export function Inbox() {
  const [tick, setTick] = useState(0)
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 60000); return () => clearInterval(t) }, [])
  const data = useAsync(async () => {
    const { data: rows, error } = await sb().from('bde_inbox').select('*').order('created_at', { ascending: false }).limit(1000)
    if (error) throw error
    const msgs = (rows ?? []) as Msg[]
    const ids = [...new Set(msgs.map((m) => m.contact_id).filter(Boolean))] as number[]
    const contacts = ids.length ? (await sb().from('bde_contacts').select('id, email, company, country, website, research').in('id', ids)).data ?? [] : []
    const map = new Map<string, Thread>()
    for (const m of msgs) {
      const email = (m.direction === 'in' ? m.from_email : m.to_email) ?? '?'
      const key = m.contact_id ? `c${m.contact_id}` : email
      const t = map.get(key) ?? { key, email, contact: contacts.find((c) => c.id === m.contact_id), msgs: [], last: m, unread: 0 }
      t.msgs.push(m)
      if (m.direction === 'in' && !m.handled) t.unread++
      map.set(key, t)
    }
    return [...map.values()].sort((a, b) => b.last.created_at.localeCompare(a.last.created_at))
  }, [tick])
  const [sel, setSel] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'hot'>('all')
  const [checking, setChecking] = useState(false)
  const [err, setErr] = useState('')
  const threads = (data.data ?? []).filter((t) => filter === 'all' || (filter === 'open' ? t.unread > 0 : t.msgs.some((m) => m.label === 'interested' || m.label === 'question')))
  const current = (data.data ?? []).find((t) => t.key === sel) ?? null
  async function checkNow() { setChecking(true); setErr(''); try { await ap('replies'); data.reload() } catch (e) { setErr((e as Error).message) } setChecking(false) }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 flex items-center gap-2 text-[24px]"><InboxIcon className="size-6 text-brand" />Inbox</h1>
          <p className="m-0 text-sm text-muted-foreground">Every reply to sales@bengalexport.online, checked every 15 minutes. Answer here and it goes from the sales mailbox.</p>
        </div>
        <button className={cn(btn, 'btn-outline')} onClick={checkNow} disabled={checking}><RefreshCw className={cn('size-4', checking && 'animate-spin')} />{checking ? 'Checking…' : 'Check mail now'}</button>
      </div>
      <ErrorNote error={err || data.error} />
      <div className="flex gap-2">{(['all', 'open', 'hot'] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={cn('rounded-full border px-3 py-1 text-sm', filter === f ? 'border-brand bg-brand text-white' : 'border-border bg-card')}>{f === 'all' ? 'All' : f === 'open' ? 'Needs answer' : 'Interested buyers'}</button>)}</div>
      {data.loading && !data.data ? <Loading /> : !threads.length ? (
        <Empty title="No replies yet">Buyer replies appear here within 15 minutes of arriving. Interested buyers are also emailed to you straight away.</Empty>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <ul className="m-0 grid max-h-[70vh] list-none content-start gap-1 overflow-y-auto rounded-xl border border-border bg-card p-1.5">
            {threads.map((t) => {
              const label = t.msgs.find((m) => m.label)?.label
              return (
                <li key={t.key}>
                  <button onClick={() => setSel(t.key)} className={cn('w-full rounded-lg px-3 py-2.5 text-left', sel === t.key ? 'bg-brand-soft' : 'hover:bg-muted')}>
                    <span className="flex items-center justify-between gap-2"><b className="truncate text-[14px]">{t.contact?.company ?? t.email}</b><span className="flex-none text-[11.5px] text-muted-foreground">{ago(t.last.created_at)}</span></span>
                    <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{t.last.summary || t.last.subject || '(no subject)'}</span>
                    <span className="mt-1 flex gap-1.5">{t.unread > 0 && <Badge tone="warn">Needs answer</Badge>}{label && <Badge tone={TONE[label] ?? 'neutral'}>{label.replace('_', ' ')}</Badge>}{t.contact?.country && <span className="text-[12px] text-muted-foreground">{t.contact.country}</span>}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {current ? <ThreadView t={current} onSent={() => data.reload()} /> : <div className="grid place-items-center rounded-xl border border-dashed border-border bg-card p-10 text-sm text-muted-foreground">Choose a conversation</div>}
        </div>
      )}
    </div>
  )
}

function ThreadView({ t, onSent }: { t: Thread; onSent: () => void }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const sent = useAsync(async () => t.contact ? (await sb().from('bde_outreach').select('id, created_at, step, subject, body').eq('contact_id', t.contact.id).eq('status', 'sent').order('created_at')).data ?? [] : [], [t.key])
  const items = useMemo(() => {
    const ours = (sent.data ?? []).map((o: any) => ({ id: `o${o.id}`, at: o.created_at, mine: true, who: `Our email ${o.step + 1}`, subject: o.subject, body: o.body }))
    const box = t.msgs.map((m) => ({ id: `m${m.id}`, at: m.created_at, mine: m.direction === 'out', who: m.direction === 'out' ? 'Our reply' : t.contact?.company ?? m.from_email, subject: m.subject, body: m.body, m }))
    return [...ours, ...box].sort((a, b) => a.at.localeCompare(b.at))
  }, [sent.data, t])
  const lastIn = [...t.msgs].reverse().find((m) => m.direction === 'in') ?? t.msgs.find((m) => m.direction === 'in')
  const advice = t.msgs.find((m) => m.direction === 'in' && (m.next_step || m.care_note))
  async function send(e: React.FormEvent) {
    e.preventDefault(); if (!text.trim() || !lastIn) return
    setBusy(true); setErr('')
    try { await ap('reply', { inbox_id: lastIn.id, text }); setText(''); onSent() } catch (x) { setErr((x as Error).message) }
    setBusy(false)
  }
  return (
    <section className="flex flex-col rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-3">
        <b className="text-[16px]">{t.contact?.company ?? t.email}</b>
        <p className="m-0 text-[13px] text-muted-foreground"><Mail className="mr-1 inline size-3.5" />{t.email}{t.contact?.country ? ` · ${t.contact.country}` : ''}{t.contact?.research?.label ? ` · offered ${t.contact.research.label}` : ''}{t.contact?.website ? <> · <a href={t.contact.website} target="_blank" rel="noreferrer">website</a></> : ''}</p>
        {advice && <p className="mt-2 mb-0 rounded-lg bg-brand-soft/60 px-3 py-2 text-[13px]"><b>AI suggests:</b> {advice.next_step}{advice.care_note ? ` · ${advice.care_note}` : ''}</p>}
      </header>
      <div className="grid max-h-[55vh] gap-3 overflow-y-auto px-5 py-4">
        {items.map((it) => (
          <div key={it.id} className={cn('max-w-[88%] rounded-xl px-4 py-3 text-[14px]', it.mine ? 'justify-self-end bg-muted' : 'justify-self-start border border-brand/30 bg-brand-soft/40')}>
            <span className="block text-[11.5px] font-semibold text-muted-foreground">{it.who} · {fmtTime(it.at)}</span>
            {it.subject && <span className="block text-[13px] font-semibold">{it.subject}</span>}
            <span className="mt-1 block whitespace-pre-wrap">{it.body}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="grid gap-2 border-t border-border p-4">
        <textarea className="field min-h-28 text-[14px]" placeholder={lastIn ? `Reply to ${t.email}…` : 'This buyer has not written to us yet'} value={text} onChange={(e) => setText(e.target.value)} disabled={!lastIn} />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12.5px] text-muted-foreground">Sent from sales@bengalexport.online with your signature, in the same email thread.</span>
          <button className={cn(btn, 'btn-primary')} disabled={busy || !text.trim() || !lastIn}><Send className="size-4" />{busy ? 'Sending…' : 'Send reply'}</button>
        </div>
        <ErrorNote error={err} />
      </form>
    </section>
  )
}
