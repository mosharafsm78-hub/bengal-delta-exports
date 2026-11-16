import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Check, MessageSquareWarning, Plus, Send, Trash2, X } from 'lucide-react'
import { sb, ago, fmtDate } from './client'
import { Badge, Card, Drawer, Empty, ErrorNote, Field, Kpi, Loading, btn, input, useAsync } from './ui'
import { cn } from '@/lib/utils'

type Buyer = Record<string, any> & { user_id: string; email: string; name: string; company: string; country: string; status: string; agent_id: number | null; checks: Record<string, boolean>; created_at: string }
type Agent = { id: number; name: string; title: string | null; email: string | null; whatsapp: string | null; languages: string | null; bio: string | null; active: boolean }
type Msg = { id: number; created_at: string; buyer_id: string; sender: string; agent_name: string | null; body: string; needs_human: boolean; handled: boolean }

const TONE: Record<string, 'good' | 'warn' | 'bad' | 'info' | 'neutral'> = { verified: 'good', trusted: 'info', review: 'warn', rejected: 'bad', new: 'neutral' }
const LABEL: Record<string, string> = { verified: 'Verified', trusted: 'Trusted', review: 'Needs review', rejected: 'Rejected', new: 'Email not confirmed' }

export function Buyers() {
  const { data, loading, error, reload } = useAsync(async () => {
    const s = sb()
    const [b, a, m] = await Promise.all([
      s.from('bde_buyers').select('*').order('created_at', { ascending: false }).limit(1000),
      s.from('bde_agents').select('*').order('id'),
      s.from('bde_buyer_messages').select('id, created_at, buyer_id, sender, agent_name, body, needs_human, handled').in('sender', ['buyer']).eq('handled', false).order('created_at', { ascending: false }).limit(500),
    ])
    if (b.error) throw b.error
    return { buyers: (b.data ?? []) as Buyer[], agents: (a.data ?? []) as Agent[], open: (m.data ?? []) as Msg[] }
  }, [])
  const [filter, setFilter] = useState<'all' | 'review' | 'attention'>('all')
  const [sel, setSel] = useState<Buyer | null>(null)
  const [agentsOpen, setAgentsOpen] = useState(false)
  if (loading && !data) return <Loading />
  if (error) return <ErrorNote error={error} />
  const { buyers, agents, open } = data!
  const needs = new Map<string, number>()
  for (const m of open) if (m.needs_human) needs.set(m.buyer_id, (needs.get(m.buyer_id) ?? 0) + 1)
  const list = buyers.filter((b) => filter === 'all' || (filter === 'review' ? b.status === 'review' : needs.has(b.user_id)))
  const agentName = (id: number | null) => agents.find((a) => a.id === id)?.name ?? '—'
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="m-0 text-[24px]">Buyers</h1><p className="m-0 text-sm text-muted-foreground">Free buyer accounts. Verified buyers get a named agent; the AI assistant answers everyone instantly.</p></div>
        <button className={cn(btn, 'btn-outline')} onClick={() => setAgentsOpen(true)}>Agents ({agents.filter((a) => a.active).length})</button>
      </div>
      {!agents.length && <p className="m-0 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-950">Add your care team as agents (name, WhatsApp, email). Verified buyers are then assigned to them automatically, and they get an email when a buyer needs a person.</p>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Buyer accounts" value={buyers.length} />
        <Kpi label="Verified or trusted" value={buyers.filter((b) => b.status === 'verified' || b.status === 'trusted').length} tone="good" />
        <Kpi label="Waiting for review" value={buyers.filter((b) => b.status === 'review').length} tone={buyers.some((b) => b.status === 'review') ? 'warn' : undefined} />
        <Kpi label="Need a person" value={needs.size} tone={needs.size ? 'warn' : undefined} sub="buyers waiting for an agent reply" />
      </div>
      <div className="flex gap-2">{(['all', 'attention', 'review'] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={cn('rounded-full border px-3 py-1 text-sm', filter === f ? 'border-brand bg-brand text-white' : 'border-border bg-card')}>{f === 'all' ? 'All' : f === 'attention' ? 'Needs a person' : 'Needs review'}</button>)}</div>
      {list.length ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="text-[12.5px] text-muted-foreground"><tr><th className="py-2 pr-3">Company</th><th className="pr-3">Country</th><th className="pr-3">Status</th><th className="pr-3">Agent</th><th className="pr-3">Joined</th><th /></tr></thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.user_id} className="cursor-pointer border-t border-border hover:bg-muted/50" onClick={() => setSel(b)}>
                    <td className="py-2.5 pr-3"><b>{b.company}</b><span className="block text-[12.5px] text-muted-foreground">{b.name} · {b.email}</span></td>
                    <td className="pr-3">{b.country}</td>
                    <td className="pr-3"><Badge tone={TONE[b.status]}>{LABEL[b.status] ?? b.status}</Badge></td>
                    <td className="pr-3">{agentName(b.agent_id)}</td>
                    <td className="pr-3 whitespace-nowrap">{ago(b.created_at)}</td>
                    <td>{needs.has(b.user_id) && <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-amber-700"><MessageSquareWarning className="size-4" />{needs.get(b.user_id)}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : <Empty title="No buyers here yet">Buyers create free accounts at /account. The website links to it from the header, the home page and every product page.</Empty>}
      <BuyerDrawer buyer={sel} agents={agents} onClose={() => setSel(null)} onChange={() => { reload() }} />
      <AgentsDrawer open={agentsOpen} agents={agents} onClose={() => setAgentsOpen(false)} onChange={reload} />
    </div>
  )
}

function BuyerDrawer({ buyer, agents, onClose, onChange }: { buyer: Buyer | null; agents: Agent[]; onClose: () => void; onChange: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [reqs, setReqs] = useState<any[]>([])
  const [text, setText] = useState('')
  const [as, setAs] = useState<number | ''>('')
  const [err, setErr] = useState('')
  const [b, setB] = useState<Buyer | null>(buyer)
  useEffect(() => { setB(buyer); setAs(buyer?.agent_id ?? '') }, [buyer])
  const load = async () => {
    if (!buyer) return
    const [m, r] = await Promise.all([
      sb().from('bde_buyer_messages').select('*').eq('buyer_id', buyer.user_id).order('created_at').limit(400),
      sb().from('bde_leads').select('id, reference, created_at, items, stage').ilike('email', buyer.email.replace(/[\\%_]/g, '\\$&')).order('created_at', { ascending: false }).limit(20),
    ])
    setMsgs((m.data ?? []) as Msg[]); setReqs(r.data ?? [])
  }
  useEffect(() => { load() }, [buyer?.user_id]) // eslint-disable-line react-hooks/exhaustive-deps
  const agent = useMemo(() => agents.find((a) => a.id === (as || b?.agent_id)), [agents, as, b])
  if (!b) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>
  async function patch(p: Record<string, unknown>) {
    setErr('')
    const { error } = await sb().from('bde_buyers').update(p).eq('user_id', b!.user_id)
    if (error) { setErr(error.message); return }
    setB({ ...b!, ...p }); onChange()
  }
  async function verify(ok: boolean) {
    const agent_id = ok ? (b!.agent_id ?? (as || agents.find((a) => a.active)?.id || null)) : b!.agent_id
    await patch({ status: ok ? 'verified' : 'rejected', verified_at: ok ? new Date().toISOString() : null, agent_id })
    await sb().from('bde_buyer_messages').insert({ buyer_id: b!.user_id, sender: 'system', body: ok ? 'Good news: your company is verified. Your personal sourcing agent is now assigned to you.' : 'We could not verify your company yet. Please reply here with your company registration or VAT number, or WhatsApp us.' })
    load()
  }
  async function reply(e: React.FormEvent) {
    e.preventDefault(); if (!text.trim()) return
    const name = agent?.name ?? 'BengalExport buyer desk'
    const { error } = await sb().from('bde_buyer_messages').insert({ buyer_id: b!.user_id, sender: 'agent', agent_name: name, body: text.trim() })
    if (error) { setErr(error.message); return }
    await sb().from('bde_buyer_messages').update({ handled: true }).eq('buyer_id', b!.user_id).eq('sender', 'buyer').eq('handled', false)
    setText(''); load(); onChange()
  }
  const CHECKS: [string, string][] = [['company_email', 'Company email'], ['email_matches_website', 'Email matches website'], ['mail_server', 'Mail server'], ['website_live', 'Website online'], ['company_number', 'Company / VAT number']]
  return (
    <Drawer open={!!buyer} onClose={onClose} title={<span className="flex items-center gap-2">{b.company}{(b.status === 'verified' || b.status === 'trusted') && <BadgeCheck className="size-5 text-brand" />}</span>}>
      <div className="grid gap-4 text-[14px]">
        <div className="grid gap-1">
          <p className="m-0">{b.name} · <a href={`mailto:${b.email}`}>{b.email}</a>{b.phone ? ` · ${b.phone}` : ''}</p>
          <p className="m-0 text-muted-foreground">{b.country} · {b.buyer_type ?? 'type not given'} · {b.yearly_volume ?? 'volume not given'}{b.website ? <> · <a href={b.website.startsWith('http') ? b.website : `https://${b.website}`} target="_blank" rel="noreferrer">{b.website}</a></> : ''}</p>
          {b.company_number && <p className="m-0 text-muted-foreground">Company / VAT number: {b.company_number}</p>}
          <p className="m-0 text-muted-foreground">Joined {fmtDate(b.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">{CHECKS.map(([k, l]) => <span key={k} className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px]', b.checks?.[k] ? 'bg-ok-soft text-[hsl(var(--ok))]' : 'bg-muted text-muted-foreground')}>{b.checks?.[k] ? <Check className="size-3" /> : <X className="size-3" />}{l}</span>)}</div>
        <div className="flex flex-wrap items-end gap-2">
          <Field label="Agent"><select className={input} value={as} onChange={(e) => { const v = e.target.value ? Number(e.target.value) : ''; setAs(v); patch({ agent_id: v || null }) }}><option value="">None</option>{agents.filter((a) => a.active || a.id === b.agent_id).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
          {b.status !== 'verified' && b.status !== 'trusted' && <button className={cn(btn, 'btn-primary')} onClick={() => verify(true)}><BadgeCheck className="size-4" />Verify</button>}
          {b.status !== 'rejected' && <button className={cn(btn, 'btn-outline')} onClick={() => verify(false)}>Reject</button>}
        </div>
        <ErrorNote error={err} />
        {reqs.length > 0 && <div><p className="m-0 mb-1 font-semibold">Requests</p>{reqs.map((r) => <p key={r.id} className="m-0 text-[13.5px]">{r.reference} · {(r.items ?? []).map((i: any) => i.style).join(', ')} · <b>{r.stage}</b> · {ago(r.created_at)}</p>)}</div>}
        <div>
          <p className="m-0 mb-2 font-semibold">Conversation</p>
          <div className="grid max-h-[420px] gap-2 overflow-y-auto rounded-lg bg-muted/50 p-3">
            {msgs.length ? msgs.map((m) => (
              <div key={m.id} className={cn('rounded-lg px-3 py-2 text-[13.5px] whitespace-pre-wrap', m.sender === 'buyer' ? 'bg-card' : m.sender === 'agent' ? 'bg-brand-soft' : m.sender === 'ai' ? 'bg-card/60 text-muted-foreground' : 'text-center text-[12.5px] text-muted-foreground')}>
                {m.sender !== 'system' && <span className="block text-[11.5px] font-semibold text-muted-foreground">{m.sender === 'buyer' ? b.name : m.sender === 'ai' ? 'AI assistant' : m.agent_name}{m.needs_human && !m.handled ? ' · needs a person' : ''} · {ago(m.created_at)}</span>}
                {m.body}
              </div>
            )) : <p className="m-0 text-muted-foreground">No messages yet.</p>}
          </div>
          <form onSubmit={reply} className="mt-2 flex gap-2">
            <input className={input} placeholder={`Reply as ${agent?.name ?? 'BengalExport buyer desk'}…`} value={text} onChange={(e) => setText(e.target.value)} />
            <button className={cn(btn, 'btn-primary')} aria-label="Send"><Send className="size-4" /></button>
          </form>
        </div>
      </div>
    </Drawer>
  )
}

function AgentsDrawer({ open, agents, onClose, onChange }: { open: boolean; agents: Agent[]; onClose: () => void; onChange: () => void }) {
  const blank = { name: '', title: 'Your sourcing agent', email: '', whatsapp: '', languages: 'English', bio: '' }
  const [f, setF] = useState(blank)
  const [err, setErr] = useState('')
  async function add(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    const { error } = await sb().from('bde_agents').insert({ ...f, email: f.email || null, whatsapp: f.whatsapp || null, bio: f.bio || null })
    if (error) setErr(error.message); else { setF(blank); onChange() }
  }
  const toggle = async (a: Agent) => { await sb().from('bde_agents').update({ active: !a.active }).eq('id', a.id); onChange() }
  const remove = async (a: Agent) => { const { error } = await sb().from('bde_agents').delete().eq('id', a.id); if (error) setErr('This agent has buyers. Switch them off instead.'); onChange() }
  return (
    <Drawer open={open} onClose={onClose} title="Agents">
      <div className="grid gap-4">
        <p className="m-0 text-sm text-muted-foreground">Buyers see the agent's name, title, languages, short bio and WhatsApp. New verified buyers go to the active agent with the fewest buyers.</p>
        {agents.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-3 text-[14px]">
            <span><b>{a.name}</b> <span className="text-muted-foreground">· {a.title}</span><span className="block text-[12.5px] text-muted-foreground">{[a.whatsapp, a.email, a.languages].filter(Boolean).join(' · ')}</span></span>
            <span className="flex gap-1"><button className={cn(btn, 'btn-outline !py-1 text-[12.5px]')} onClick={() => toggle(a)}>{a.active ? 'Active' : 'Off'}</button><button className={cn(btn, '!px-2 !py-1')} onClick={() => remove(a)} aria-label="Delete"><Trash2 className="size-4" /></button></span>
          </div>
        ))}
        <form onSubmit={add} className="grid gap-2 rounded-lg border border-dashed border-border p-3">
          <p className="m-0 font-semibold">Add an agent</p>
          <input className={input} required placeholder="Name buyers will see" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className={input} placeholder="Title, e.g. Sourcing agent, home textiles" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          <input className={input} placeholder="WhatsApp number with country code" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} />
          <input className={input} type="email" placeholder="Email for alerts when a buyer needs a person" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <input className={input} placeholder="Languages" value={f.languages} onChange={(e) => setF({ ...f, languages: e.target.value })} />
          <textarea className={input} placeholder="One or two lines about them (optional)" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
          <ErrorNote error={err} />
          <button className={cn(btn, 'btn-primary justify-self-start')}><Plus className="size-4" />Add agent</button>
        </form>
      </div>
    </Drawer>
  )
}
