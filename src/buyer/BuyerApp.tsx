import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { BadgeCheck, Bot, Check, ClipboardList, Clock, Headset, Loader2, LogOut, MessageCircle, Plus, Send, ShieldCheck, Sparkles, User } from 'lucide-react'
import { CATS } from '@/data/catalog'
import { MARKETS } from '@/data/markets'
import { SITE } from '@/data/site'
import { cn } from '@/lib/utils'
import { bsb, desk, STAGES, type Agent, type Buyer, type Msg, type Req } from './client'

const field = 'w-full rounded-lg border border-border bg-card px-3 py-2.5 text-[15px] outline-none focus:border-brand'
const COUNTRIES = [...new Set([...MARKETS.map((m) => m.name), 'United States', 'Saudi Arabia', 'United Arab Emirates', 'Malaysia', 'Singapore', 'South Africa', 'Brazil', 'Mexico', 'India'])].sort()
const BUYER_TYPES = ['Importer / wholesaler', 'Brand / private label', 'Retailer', 'Online seller', 'Promotional / uniform supplier', 'Hotel / hospitality supplier', 'Buying house / agent', 'Other']
const VOLUMES = ['Under $10,000 a year', '$10,000 – $50,000', '$50,000 – $250,000', '$250,000 – $1 million', 'Over $1 million']

export const TIERS = [
  { id: 'registered', name: 'Registered buyer', how: 'Free account', perks: ['Free offers within 24 hours', 'Live tracker for every request', 'AI assistant, answers at any hour'] },
  { id: 'verified', name: 'Verified buyer', how: 'Company checked (usually instant)', perks: ['Verified buyer badge', 'Your own named sourcing agent', 'Sourcing outside our catalogue in 48 hours', 'Priority queue for offers and samples', 'Price updates for products you buy'] },
  { id: 'trusted', name: 'Trusted buyer', how: 'After your first LC order', perks: ['Priority factory booking in peak season', 'Inspection photos and reports kept in your account', 'First look at ready stock and factory surplus'] },
]
const tierIndex = (s?: string) => (s === 'trusted' ? 2 : s === 'verified' ? 1 : 0)

export function BuyerBadge({ status, className }: { status?: string; className?: string }) {
  if (status === 'verified' || status === 'trusted')
    return <span className={cn('inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[12.5px] font-semibold text-brand-ink', className)}><BadgeCheck className="size-4" aria-hidden="true" />{status === 'trusted' ? 'Trusted buyer' : 'Verified buyer'}</span>
  return <span className={cn('inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[12.5px] font-semibold text-muted-foreground', className)}><Clock className="size-4" aria-hidden="true" />{status === 'review' ? 'Verification in progress' : status === 'rejected' ? 'Not verified' : 'Registered buyer'}</span>
}

export function BuyerApp() {
  const [session, setSession] = useState<boolean | null>(null)
  useEffect(() => {
    bsb().auth.getSession().then(({ data }) => setSession(!!data.session))
    const { data } = bsb().auth.onAuthStateChange((_e, s) => setSession(!!s))
    return () => data.subscription.unsubscribe()
  }, [])
  if (session === null) return <Center><Loader2 className="size-6 animate-spin text-brand" /></Center>
  return session ? <Desk /> : <AuthScreens />
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-[60vh] place-items-center px-4">{children}</div>
}

// ---------------- sign in / sign up ----------------
function AuthScreens() {
  const [mode, setMode] = useState<'in' | 'up' | 'reset'>(() => (typeof location !== 'undefined' && location.hash === '#signup' ? 'up' : 'in'))
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_1.1fr] lg:py-14">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[13px] font-semibold text-brand"><ShieldCheck className="size-4" aria-hidden="true" />Free for buyers, always</span>
        <h1 className="mt-4 mb-3 text-[clamp(2rem,4vw,2.8rem)] leading-tight">Your buyer desk for Bangladesh</h1>
        <p className="text-[17px] text-muted-foreground">One free account for all your sourcing: offers, samples, orders and a personal agent who knows your business. No subscription, no fees.</p>
        <div className="mt-6 grid gap-3">
          {TIERS.map((t, i) => (
            <div key={t.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2"><b className="text-[15.5px]">{i === 1 && <BadgeCheck className="mr-1 inline size-4 text-brand" aria-hidden="true" />}{t.name}</b><span className="text-[12.5px] text-muted-foreground">{t.how}</span></div>
              <ul className="mt-2 mb-0 grid gap-1 pl-0 text-[14px]">{t.perks.map((p) => <li key={p} className="flex list-none gap-2"><Check className="mt-0.5 size-4 flex-none text-brand" aria-hidden="true" />{p}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {mode === 'in' && <SignIn onUp={() => setMode('up')} onReset={() => setMode('reset')} />}
        {mode === 'up' && <SignUp onIn={() => setMode('in')} />}
        {mode === 'reset' && <Reset onIn={() => setMode('in')} />}
      </div>
    </div>
  )
}

function SignIn({ onUp, onReset }: { onUp: () => void; onReset: () => void }) {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await bsb().auth.signInWithPassword({ email: email.trim(), password: pw })
    if (error) setErr('Email or password is not correct.')
    setBusy(false)
  }
  return (
    <form onSubmit={go} className="grid gap-3">
      <h2 className="m-0 text-[24px]">Sign in</h2>
      <p className="m-0 text-[14.5px] text-muted-foreground">New here? <button type="button" onClick={onUp} className="font-semibold text-brand">Create a free buyer account</button></p>
      <input className={field} type="email" required autoComplete="email" placeholder="Business email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
      <input className={field} type="password" required autoComplete="current-password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="Password" />
      {err && <p className="m-0 text-[13.5px] text-danger">{err}</p>}
      <button disabled={busy} className="btn btn-primary">{busy ? 'Signing in…' : 'Sign in'}</button>
      <button type="button" onClick={onReset} className="justify-self-start text-[14px] text-muted-foreground underline">Forgot your password?</button>
    </form>
  )
}

function SignUp({ onIn }: { onIn: () => void }) {
  const [f, setF] = useState({ name: '', company: '', email: '', password: '', country: '', website: '', phone: '', buyer_type: '', yearly_volume: '', company_number: '', website_url: '' })
  const [interests, setInterests] = useState<string[]>([])
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('')
    try {
      await desk('signup', { ...f, interests }, false)
      const { error } = await bsb().auth.signInWithPassword({ email: f.email.trim(), password: f.password })
      if (error) throw new Error('Account created. Please sign in.')
    } catch (x) { setErr((x as Error).message) }
    setBusy(false)
  }
  return (
    <form onSubmit={go} className="grid gap-3">
      <h2 className="m-0 text-[24px]">Create your free buyer account</h2>
      <p className="m-0 text-[14.5px] text-muted-foreground">Takes one minute. Already have one? <button type="button" onClick={onIn} className="font-semibold text-brand">Sign in</button></p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} required placeholder="Your name" autoComplete="name" value={f.name} onChange={set('name')} aria-label="Your name" />
        <input className={field} required placeholder="Company" autoComplete="organization" value={f.company} onChange={set('company')} aria-label="Company" />
      </div>
      <input className={field} type="email" required placeholder="Business email (your company address)" autoComplete="email" value={f.email} onChange={set('email')} aria-label="Business email" />
      <input className={field} type="password" required minLength={8} placeholder="Choose a password (8+ characters)" autoComplete="new-password" value={f.password} onChange={set('password')} aria-label="Password" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} required list="bde-countries" placeholder="Country" value={f.country} onChange={set('country')} aria-label="Country" />
        <input className={field} placeholder="Company website" value={f.website} onChange={set('website')} aria-label="Company website" />
      </div>
      <datalist id="bde-countries">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
      <div className="grid gap-3 sm:grid-cols-2">
        <select className={field} value={f.buyer_type} onChange={set('buyer_type')} aria-label="Type of business"><option value="">Type of business</option>{BUYER_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        <select className={field} value={f.yearly_volume} onChange={set('yearly_volume')} aria-label="Yearly buying"><option value="">Yearly buying (optional)</option>{VOLUMES.map((t) => <option key={t}>{t}</option>)}</select>
      </div>
      <div>
        <p className="mt-1 mb-2 text-[14px] font-semibold">What do you buy?</p>
        <div className="flex flex-wrap gap-2">{CATS.map((c) => { const on = interests.includes(c.id); return <button type="button" key={c.id} onClick={() => setInterests(on ? interests.filter((x) => x !== c.id) : [...interests, c.id])} className={cn('rounded-full border px-3 py-1.5 text-[13.5px]', on ? 'border-brand bg-brand-soft font-semibold text-brand' : 'border-border bg-card')}>{c.short ?? c.name}</button> })}</div>
      </div>
      <input className="hidden" tabIndex={-1} autoComplete="off" value={f.website_url} onChange={set('website_url')} aria-hidden="true" />
      <p className="m-0 text-[12.5px] text-muted-foreground">Use your company email and website to get the Verified buyer badge instantly. We never share your details.</p>
      {err && <p className="m-0 text-[13.5px] text-danger">{err}</p>}
      <button disabled={busy} className="btn btn-primary">{busy ? 'Creating your account…' : 'Create free account'}</button>
    </form>
  )
}

function Reset({ onIn }: { onIn: () => void }) {
  const [email, setEmail] = useState(''); const [code, setCode] = useState(''); const [pw, setPw] = useState(''); const [sent, setSent] = useState(false); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('')
    try {
      if (!sent) { await desk('reset-start', { email }, false); setSent(true); setMsg('If this email has an account, a 6-digit code is on its way.') }
      else { await desk('reset-finish', { email, code, password: pw }, false); await bsb().auth.signInWithPassword({ email, password: pw }) }
    } catch (x) { setMsg((x as Error).message) }
    setBusy(false)
  }
  return (
    <form onSubmit={go} className="grid gap-3">
      <h2 className="m-0 text-[24px]">Reset your password</h2>
      <input className={field} type="email" required placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" disabled={sent} />
      {sent && <>
        <input className={field} required inputMode="numeric" placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Code" />
        <input className={field} type="password" required minLength={8} placeholder="New password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="New password" />
      </>}
      {msg && <p className="m-0 text-[13.5px] text-muted-foreground">{msg}</p>}
      <button disabled={busy} className="btn btn-primary">{sent ? 'Save new password' : 'Send me a code'}</button>
      <button type="button" onClick={onIn} className="justify-self-start text-[14px] text-muted-foreground underline">Back to sign in</button>
    </form>
  )
}

// ---------------- the desk ----------------
function Desk() {
  const [b, setB] = useState<Buyer | null>(null)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [reqs, setReqs] = useState<Req[]>([])
  const [tab, setTab] = useState<'agent' | 'requests' | 'new' | 'account'>('agent')
  const [missing, setMissing] = useState(false)
  const load = useCallback(async () => {
    const s = bsb()
    const { data: me } = await s.from('bde_buyers').select('*').maybeSingle()
    if (!me) { setMissing(true); return }
    setB(me as Buyer)
    const [{ data: m }, { data: r }, a] = await Promise.all([
      s.from('bde_buyer_messages').select('id, created_at, sender, agent_name, body, lead_id').order('created_at').limit(300),
      s.from('bde_leads').select('id, created_at, reference, items, requirement, quantity, unit, port, stage').order('created_at', { ascending: false }).limit(50),
      me.agent_id ? s.from('bde_agents').select('*').eq('id', me.agent_id).maybeSingle() : Promise.resolve({ data: null }),
    ])
    setMsgs((m ?? []) as Msg[]); setReqs((r ?? []) as Req[]); setAgent((a as { data: Agent | null }).data)
  }, [])
  useEffect(() => { load(); const t = setInterval(() => { if (document.visibilityState === 'visible') load() }, 20000); return () => clearInterval(t) }, [load])

  if (missing) return <Center><div className="max-w-md text-center"><p>This login is not a buyer account.</p><button className="btn btn-outline mt-3" onClick={() => bsb().auth.signOut()}>Sign out</button></div></Center>
  if (!b) return <Center><Loader2 className="size-6 animate-spin text-brand" /></Center>
  if (!b.email_verified) return <VerifyEmail b={b} onDone={load} />

  const tabs = [['agent', 'Your agent', Headset], ['requests', `Requests${reqs.length ? ` (${reqs.length})` : ''}`, ClipboardList], ['new', 'New request', Plus], ['account', 'Account', User]] as const
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="m-0 text-[14px] text-muted-foreground">Buyer desk</p>
          <h1 className="m-0 text-[clamp(1.6rem,3vw,2.2rem)]">{b.company}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2"><BuyerBadge status={b.status} /><span className="text-[14px] text-muted-foreground">{b.name} · {b.country}</span></div>
        </div>
        <div className="flex gap-2">
          <Link to="/products" className="btn btn-outline py-2 text-[14px]">Browse products</Link>
          <button onClick={() => bsb().auth.signOut()} className="btn py-2 text-[14px] text-muted-foreground" aria-label="Sign out"><LogOut className="size-4" aria-hidden="true" /></button>
        </div>
      </div>
      {b.status === 'review' && <Notice>We are checking your company (within one business day). Adding your company registration or VAT number in <button className="font-semibold text-brand underline" onClick={() => setTab('account')}>Account</button> speeds this up. You can already chat with the AI assistant and post requests.</Notice>}
      {b.status === 'rejected' && <Notice>We could not verify your company. Reply in the chat or WhatsApp us and we will look again.</Notice>}

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn('-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-[14.5px] font-semibold whitespace-nowrap', tab === id ? 'border-brand text-brand' : 'border-transparent text-muted-foreground')}>
            <Icon className="size-4" aria-hidden="true" />{label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'agent' && <AgentTab b={b} agent={agent} msgs={msgs} setMsgs={setMsgs} reload={load} />}
        {tab === 'requests' && <Requests reqs={reqs} onNew={() => setTab('new')} />}
        {tab === 'new' && <NewRequest onDone={() => { load(); setTab('requests') }} />}
        {tab === 'account' && <AccountTab b={b} reload={load} />}
      </div>
    </div>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 mb-0 rounded-lg border border-amber-300 bg-amber-50 p-3 text-[14px] text-amber-950">{children}</p>
}

function VerifyEmail({ b, onDone }: { b: Buyer; onDone: () => void }) {
  const [code, setCode] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  async function go(e: React.FormEvent) { e.preventDefault(); setBusy(true); setMsg(''); try { await desk('verify', { code }); onDone() } catch (x) { setMsg((x as Error).message) } setBusy(false) }
  async function again() { setMsg(''); try { await desk('resend'); setMsg('A new code is on its way.') } catch (x) { setMsg((x as Error).message) } }
  return (
    <Center>
      <form onSubmit={go} className="grid w-full max-w-md gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="m-0 text-[24px]">Confirm your email</h1>
        <p className="m-0 text-[15px] text-muted-foreground">We sent a 6-digit code to <b className="text-foreground">{b.email}</b>. Check your spam folder if it has not arrived.</p>
        <input className={cn(field, 'num text-center text-[22px] tracking-[0.4em]')} required inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} aria-label="Code" autoFocus />
        {msg && <p className="m-0 text-[13.5px] text-muted-foreground">{msg}</p>}
        <button disabled={busy || code.length < 6} className="btn btn-primary">{busy ? 'Checking your company…' : 'Confirm and get verified'}</button>
        <div className="flex justify-between text-[14px]"><button type="button" onClick={again} className="text-brand underline">Send a new code</button><button type="button" onClick={() => bsb().auth.signOut()} className="text-muted-foreground underline">Sign out</button></div>
      </form>
    </Center>
  )
}

function AgentTab({ b, agent, msgs, setMsgs, reload }: { b: Buyer; agent: Agent | null; msgs: Msg[]; setMsgs: (m: Msg[]) => void; reload: () => void }) {
  const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('')
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [msgs.length])
  const verified = b.status === 'verified' || b.status === 'trusted'
  const wa = (agent?.whatsapp || SITE.whatsapp || '').replace(/\D/g, '')
  async function send(e?: React.FormEvent, preset?: string) {
    e?.preventDefault(); const t = (preset ?? text).trim(); if (!t) return
    setBusy(true); setErr(''); setText('')
    setMsgs([...msgs, { id: -Date.now(), created_at: new Date().toISOString(), sender: 'buyer', agent_name: null, body: t, lead_id: null }])
    try { await desk('chat', { message: t }); await reload() } catch (x) { setErr((x as Error).message); setText(t) }
    setBusy(false)
  }
  const starters = ['What is your price for 3,000 cotton T-shirts delivered to my port?', 'Can you send samples this week?', 'How does payment by LC work?', 'Can you source a product that is not in your catalogue?']
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="grid content-start gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="m-0 text-[12.5px] font-semibold tracking-wide text-muted-foreground uppercase">Your sourcing agent</p>
          {verified && agent ? (
            <>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-brand text-[18px] font-semibold text-brand-ink">{agent.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                <span><b className="block text-[16px]">{agent.name}</b><span className="text-[13px] text-muted-foreground">{agent.title ?? 'Sourcing agent'}</span></span>
              </div>
              {agent.bio && <p className="mt-3 mb-0 text-[14px] text-muted-foreground">{agent.bio}</p>}
              <p className="mt-2 mb-0 text-[13px] text-muted-foreground">Speaks {agent.languages ?? 'English'} · replies on business days</p>
            </>
          ) : verified ? (
            <p className="mt-3 mb-0 text-[14.5px]">Your named agent is being assigned. Meanwhile the BengalExport buyer desk team answers your messages.</p>
          ) : (
            <p className="mt-3 mb-0 text-[14.5px]">A named personal agent comes with the <b>Verified buyer</b> badge. The AI assistant answers you now.</p>
          )}
          {wa && <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello, this is ${b.name} from ${b.company} (BengalExport buyer account).`)}`} target="_blank" rel="noreferrer" className="btn mt-4 w-full bg-[#25D366] py-2.5 text-[14.5px] text-white"><MessageCircle className="size-4" aria-hidden="true" />WhatsApp</a>}
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="m-0 flex items-center gap-2 text-[14.5px] font-semibold"><Sparkles className="size-4 text-brand" aria-hidden="true" />Your level</p>
          <ol className="mt-3 mb-0 grid gap-2 pl-0">
            {TIERS.map((t, i) => <li key={t.id} className={cn('flex list-none items-center gap-2 text-[14px]', i <= tierIndex(b.status) ? 'font-semibold' : 'text-muted-foreground')}><span className={cn('grid size-5 place-items-center rounded-full text-[11px]', i <= tierIndex(b.status) ? 'bg-brand text-brand-ink' : 'bg-muted')}>{i <= tierIndex(b.status) ? <Check className="size-3" /> : i + 1}</span>{t.name}</li>)}
          </ol>
          {tierIndex(b.status) < 2 && <p className="mt-3 mb-0 text-[13px] text-muted-foreground">Next: {TIERS[tierIndex(b.status) + 1].perks[0].toLowerCase()} and more.</p>}
        </div>
      </aside>
      <section className="flex min-h-[520px] flex-col rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3 text-[14px] text-muted-foreground"><Bot className="mr-1 inline size-4 text-brand" aria-hidden="true" />The AI assistant replies instantly{verified && agent ? `; ${agent.name} joins whenever a person is needed` : '; our team joins whenever a person is needed'}.</div>
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" style={{ maxHeight: 560 }}>
          {msgs.map((m) => <Bubble key={m.id} m={m} agentName={agent?.name} />)}
          {busy && <p className="m-0 flex items-center gap-2 text-[13.5px] text-muted-foreground"><Loader2 className="size-4 animate-spin" />Typing…</p>}
          <div ref={end} />
        </div>
        {msgs.filter((m) => m.sender === 'buyer').length === 0 && (
          <div className="flex flex-wrap gap-2 px-5 pb-3">{starters.map((s) => <button key={s} onClick={() => send(undefined, s)} className="rounded-full border border-border px-3 py-1.5 text-left text-[13px] hover:border-brand">{s}</button>)}</div>
        )}
        <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
          <input className={field} placeholder="Ask about products, prices, samples, shipping…" value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" />
          <button disabled={busy || !text.trim()} className="btn btn-primary px-4" aria-label="Send"><Send className="size-4" /></button>
        </form>
        {err && <p className="m-0 px-4 pb-3 text-[13px] text-danger">{err}</p>}
      </section>
    </div>
  )
}

function Bubble({ m, agentName }: { m: Msg; agentName?: string }) {
  const mine = m.sender === 'buyer'
  if (m.sender === 'system') return <p className="mx-auto my-1 max-w-[85%] rounded-lg bg-muted px-3 py-2 text-center text-[13.5px] text-muted-foreground">{m.body}</p>
  const who = m.sender === 'ai' ? 'AI assistant' : m.sender === 'agent' ? m.agent_name || agentName || 'Your agent' : 'You'
  return (
    <div className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
      <span className="mb-0.5 text-[12px] text-muted-foreground">{who} · {new Date(m.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
      <div className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-[14.5px] whitespace-pre-wrap', mine ? 'bg-brand text-brand-ink' : m.sender === 'agent' ? 'border-2 border-brand/30 bg-brand-soft' : 'bg-muted')}>{m.body}</div>
    </div>
  )
}

function Requests({ reqs, onNew }: { reqs: Req[]; onNew: () => void }) {
  if (!reqs.length) return <div className="rounded-xl border border-dashed border-border p-10 text-center"><p className="mt-0 text-[16px]">No requests yet.</p><button onClick={onNew} className="btn btn-primary"><Plus className="size-4" />Post your first request</button></div>
  return (
    <div className="grid gap-4">
      {reqs.map((r) => {
        const at = Math.max(0, STAGES.indexOf((r.stage ?? 'New request') as (typeof STAGES)[number]))
        const lost = r.stage === 'Lost'
        return (
          <article key={r.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <b className="text-[16px]">{(r.items ?? []).map((i) => i.style).join(', ') || 'Sourcing request'}</b>
              <span className="num text-[13px] text-muted-foreground">{r.reference} · {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <p className="mt-1 mb-0 text-[14px] text-muted-foreground">{[r.quantity && r.quantity !== '-' ? `${r.quantity} ${r.unit ?? ''}` : '', r.port ? `to ${r.port}` : ''].filter(Boolean).join(' · ')}</p>
            {lost ? <p className="mt-3 mb-0 text-[14px] text-muted-foreground">Closed. Message your agent to reopen it.</p> : (
              <ol className="mt-4 mb-0 grid grid-cols-4 gap-1 pl-0 sm:grid-cols-8">
                {STAGES.map((s, i) => <li key={s} className="list-none"><span className={cn('block h-1.5 rounded-full', i <= at ? 'bg-brand' : 'bg-muted')} /><span className={cn('mt-1 block text-[11.5px] leading-tight', i === at ? 'font-semibold text-brand' : 'text-muted-foreground')}>{s === 'Won' ? 'Delivered' : s}</span></li>)}
              </ol>
            )}
          </article>
        )
      })}
    </div>
  )
}

function NewRequest({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ product: '', quantity: '', unit: 'pieces', port: '', target_price: '', needed_by: '', link: '', details: '' })
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })
  async function go(e: React.FormEvent) { e.preventDefault(); setBusy(true); setErr(''); try { await desk('request', f); onDone() } catch (x) { setErr((x as Error).message) } setBusy(false) }
  return (
    <form onSubmit={go} className="grid max-w-3xl gap-3 rounded-xl border border-border bg-card p-6">
      <h2 className="m-0 text-[20px]">What do you need?</h2>
      <p className="m-0 text-[14px] text-muted-foreground">Anything made or grown in Bangladesh, in our catalogue or not. Free offer within 24 hours (48 hours outside our catalogue). Nothing to pay now.</p>
      <input className={field} required placeholder="Product, e.g. 220 gsm organic cotton hoodie" value={f.product} onChange={set('product')} aria-label="Product" />
      <div className="grid gap-3 sm:grid-cols-3">
        <input className={field} required placeholder="Quantity" value={f.quantity} onChange={set('quantity')} aria-label="Quantity" />
        <select className={field} value={f.unit} onChange={set('unit')} aria-label="Unit">{['pieces', 'pairs', 'sets', 'kg', 'tonnes', 'containers'].map((u) => <option key={u}>{u}</option>)}</select>
        <input className={field} placeholder="Target price (optional)" value={f.target_price} onChange={set('target_price')} aria-label="Target price" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} placeholder="Destination port, e.g. Felixstowe" value={f.port} onChange={set('port')} aria-label="Destination port" />
        <input className={field} placeholder="Needed by (optional)" value={f.needed_by} onChange={set('needed_by')} aria-label="Needed by" />
      </div>
      <input className={field} placeholder="Link to a photo or similar product (optional)" value={f.link} onChange={set('link')} aria-label="Reference link" />
      <textarea className={cn(field, 'min-h-28')} placeholder="Specification: fabric, sizes, colours, packing, labels, certificates…" value={f.details} onChange={set('details')} aria-label="Specification" />
      {err && <p className="m-0 text-[13.5px] text-danger">{err}</p>}
      <button disabled={busy} className="btn btn-primary justify-self-start">{busy ? 'Sending…' : 'Send request'}</button>
    </form>
  )
}

function AccountTab({ b, reload }: { b: Buyer; reload: () => void }) {
  const [f, setF] = useState({ name: b.name, company: b.company, country: b.country, website: b.website ?? '', phone: b.phone ?? '', company_number: b.company_number ?? '' })
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })
  async function go(e: React.FormEvent) { e.preventDefault(); setBusy(true); setMsg(''); try { const r = await desk('profile', f); setMsg(r.status === 'verified' ? 'Saved. Your company is now verified.' : 'Saved.'); reload() } catch (x) { setMsg((x as Error).message) } setBusy(false) }
  const CHECK_LABELS: Record<string, string> = { email_confirmed: 'Email confirmed', company_email: 'Company email address (not a free mailbox)', email_matches_website: 'Email matches your company website', mail_server: 'Company mail server found', website_live: 'Company website is online', company_number: 'Company / VAT number added' }
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <form onSubmit={go} className="grid gap-3 rounded-xl border border-border bg-card p-6">
        <h2 className="m-0 text-[20px]">Company details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-[13px] text-muted-foreground">Your name<input className={field} value={f.name} onChange={set('name')} /></label>
          <label className="grid gap-1 text-[13px] text-muted-foreground">Company<input className={field} value={f.company} onChange={set('company')} /></label>
          <label className="grid gap-1 text-[13px] text-muted-foreground">Country<input className={field} value={f.country} onChange={set('country')} list="bde-countries2" /></label>
          <label className="grid gap-1 text-[13px] text-muted-foreground">Website<input className={field} value={f.website} onChange={set('website')} /></label>
          <label className="grid gap-1 text-[13px] text-muted-foreground">Phone / WhatsApp<input className={field} value={f.phone} onChange={set('phone')} /></label>
          <label className="grid gap-1 text-[13px] text-muted-foreground">Company registration or VAT number<input className={field} value={f.company_number} onChange={set('company_number')} /></label>
        </div>
        <datalist id="bde-countries2">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
        <p className="m-0 text-[13px] text-muted-foreground">Signed in as {b.email}</p>
        {msg && <p className="m-0 text-[13.5px]">{msg}</p>}
        <button disabled={busy} className="btn btn-primary justify-self-start">{busy ? 'Saving…' : 'Save'}</button>
      </form>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between"><b>Verification</b><BuyerBadge status={b.status} /></div>
        <ul className="mt-3 mb-0 grid gap-2 pl-0">
          {Object.entries(CHECK_LABELS).map(([k, label]) => <li key={k} className="flex list-none gap-2 text-[13.5px]"><span className={cn('mt-0.5 grid size-4 flex-none place-items-center rounded-full', b.checks?.[k] ? 'bg-brand text-brand-ink' : 'bg-muted')}>{b.checks?.[k] && <Check className="size-3" />}</span>{label}</li>)}
        </ul>
        <p className="mt-3 mb-0 text-[12.5px] text-muted-foreground">We check real company details, never a payment. A free mailbox (Gmail, Outlook…) is fine; our team then confirms your company by hand.</p>
      </div>
    </div>
  )
}
