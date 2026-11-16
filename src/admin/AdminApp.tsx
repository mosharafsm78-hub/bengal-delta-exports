import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { BarChart3, Building2, FileText, LayoutDashboard, LogOut, Mail, Menu, Settings, Sparkles, Users, X } from 'lucide-react'
import { Advisor } from './Advisor'
import { cn } from '@/lib/utils'
import { sb } from './client'
import { btn, ErrorNote, Field, input } from './ui'
import { Dashboard } from './Dashboard'
import { Leads } from './Leads'
import { Suppliers } from './Suppliers'
import { Contacts } from './Contacts'
import { Campaigns } from './Campaigns'
import { Analytics } from './Analytics'
import { SettingsPage } from './Settings'
import { CommandBar } from './Command'

export type View = 'dashboard' | 'advisor' | 'leads' | 'suppliers' | 'contacts' | 'campaigns' | 'analytics' | 'settings'
const NAV: [View, string, typeof LayoutDashboard][] = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['advisor', 'AI Advisor', Sparkles],
  ['leads', 'Quote requests', FileText],
  ['suppliers', 'Suppliers', Building2],
  ['contacts', 'Contacts', Users],
  ['campaigns', 'Email campaigns', Mail],
  ['analytics', 'Website analytics', BarChart3],
  ['settings', 'Team & settings', Settings],
]

export function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [role, setRole] = useState<'loading' | 'none' | 'staff' | 'owner'>('loading')

  useEffect(() => {
    sb().auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = sb().auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setRole(session === null ? 'none' : 'loading'); return }
    Promise.all([sb().rpc('bde_is_admin'), sb().rpc('bde_is_owner')]).then(([a, o]) => setRole(o.data ? 'owner' : a.data ? 'staff' : 'none'))
  }, [session])

  if (session === undefined || (session && role === 'loading')) return <Center><p className="text-muted-foreground">Loading…</p></Center>
  if (!session) return <Login />
  if (role === 'none') return <NotAdmin email={session.user.email ?? ''} onClaimed={() => location.reload()} />
  return <Shell email={session.user.email ?? ''} owner={role === 'owner'} />
}

function Center({ children }: { children: ReactNode }) {
  return <div className="grid min-h-screen place-items-center bg-muted/40 px-4">{children}</div>
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-brand font-display text-lg font-bold text-white">B</span>
      <span className="leading-tight"><b className="block font-display text-[17px]">BengalExport</b><span className="text-[11.5px] tracking-wide text-muted-foreground uppercase">Admin</span></span>
    </div>
  )
}

function Login() {
  const [mode, setMode] = useState<'in' | 'up' | 'reset'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const redirect = typeof window !== 'undefined' ? window.location.href.split('#')[0] : undefined

  async function go(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setMsg(''); setBusy(true)
    try {
      if (mode === 'in') {
        const { error } = await sb().auth.signInWithPassword({ email, password }); if (error) throw error
      } else if (mode === 'up') {
        const { data, error } = await sb().auth.signUp({ email, password, options: { emailRedirectTo: redirect } }); if (error) throw error
        if (!data.session) setMsg('Account created. Open the confirmation email we sent you, click the link, then sign in here.')
      } else {
        const { error } = await sb().auth.resetPasswordForEmail(email, { redirectTo: redirect }); if (error) throw error
        setMsg('If this email has an account, a reset link is on its way.')
      }
    } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }

  return (
    <Center>
      <form onSubmit={go} className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-sm">
        <Brand />
        <h1 className="mt-6 mb-1 text-2xl">{mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create admin account' : 'Reset password'}</h1>
        <p className="mt-0 mb-5 text-sm text-muted-foreground">Private area for the BengalExport team.</p>
        <div className="grid gap-3">
          <Field label="Email"><input className={input} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          {mode !== 'reset' && <Field label="Password" hint={mode === 'up' ? 'At least 8 characters.' : undefined}><input className={input} type="password" required minLength={8} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>}
          <ErrorNote error={err} />
          {msg && <p className="m-0 rounded-lg bg-brand-soft px-4 py-3 text-sm text-brand">{msg}</p>}
          <button disabled={busy} className={cn(btn, 'btn-primary w-full justify-center')}>{busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create account' : 'Send reset link'}</button>
        </div>
        <div className="mt-4 flex justify-between text-[13px]">
          {mode !== 'in' ? <button type="button" className="text-brand" onClick={() => setMode('in')}>Back to sign in</button> : <button type="button" className="text-brand" onClick={() => setMode('up')}>First time? Create account</button>}
          {mode === 'in' && <button type="button" className="text-muted-foreground" onClick={() => setMode('reset')}>Forgot password?</button>}
        </div>
      </form>
    </Center>
  )
}

function NotAdmin({ email, onClaimed }: { email: string; onClaimed: () => void }) {
  const [code, setCode] = useState('')
  const [mode, setMode] = useState<'invite' | 'owner'>('invite')
  const [err, setErr] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    const { error } = await sb().rpc(mode === 'owner' ? 'bde_claim_owner' : 'bde_accept_invite', { code })
    if (error) setErr(error.message); else onClaimed()
  }
  return (
    <Center>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7">
        <Brand />
        <h1 className="mt-6 mb-2 text-xl">Enter your access code</h1>
        <p className="mt-0 text-sm text-muted-foreground">You are signed in as <b>{email}</b>. To open the panel, enter the invite code the owner gave you.</p>
        <form onSubmit={submit} className="mt-5 grid gap-3">
          <Field label={mode === 'owner' ? 'Owner setup code' : 'Invite code'} hint={mode === 'owner' ? 'Works once, for the very first owner only.' : 'Each code works once, for your email only.'}><input className={input} value={code} onChange={(e) => setCode(e.target.value)} placeholder={mode === 'owner' ? 'XXXXXXXX-XXXXXXXX' : 'XXXXXXXXXX'} autoComplete="one-time-code" /></Field>
          <ErrorNote error={err} />
          <button className={cn(btn, 'btn-primary justify-center')}>{mode === 'owner' ? 'Claim ownership' : 'Join the team'}</button>
        </form>
        <div className="mt-4 flex justify-between text-[13px]">
          <button type="button" onClick={() => { setMode(mode === 'owner' ? 'invite' : 'owner'); setErr('') }} className="text-brand">{mode === 'owner' ? 'I have an invite code' : 'I am the owner (setup code)'}</button>
          <button type="button" onClick={() => sb().auth.signOut()} className="text-muted-foreground">Sign out</button>
        </div>
      </div>
    </Center>
  )
}

function Shell({ email, owner }: { email: string; owner: boolean }) {
  const [view, setView] = useState<View>(() => (typeof location !== 'undefined' && (location.hash.slice(1) as View)) || 'dashboard')
  const [open, setOpen] = useState(false)
  useEffect(() => { if (location.hash.slice(1) !== view) history.pushState(null, '', `#${view}`); setOpen(false); scrollTo(0, 0) }, [view])
  useEffect(() => {
    const on = () => { const h = location.hash.slice(1) as View; if (NAV.some((n) => n[0] === h)) setView(h) }
    addEventListener('hashchange', on); addEventListener('popstate', on)
    return () => { removeEventListener('hashchange', on); removeEventListener('popstate', on) }
  }, [])
  const Page = { dashboard: Dashboard, advisor: Advisor, leads: Leads, suppliers: Suppliers, contacts: Contacts, campaigns: Campaigns, analytics: Analytics, settings: SettingsPage }[view]
  return (
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className={cn('fixed inset-y-0 left-0 z-40 w-[240px] border-r border-border bg-card p-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between"><Brand /><button type="button" className="p-1 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-5" /></button></div>
        <nav className="mt-6 grid gap-1">
          {NAV.map(([v, label, Icon]) => (
            <button key={v} type="button" onClick={() => setView(v)} className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[14px] font-medium', view === v ? 'bg-brand text-white' : 'text-foreground hover:bg-muted')}>
              <Icon className="size-4" aria-hidden="true" />{label}
            </button>
          ))}
        </nav>
        <div className="absolute inset-x-4 bottom-4 border-t border-border pt-3 text-[12.5px]">
          <div className="truncate font-semibold">{email}</div>
          <div className="text-muted-foreground">{owner ? 'Owner' : 'Team member'}</div>
          <button type="button" onClick={() => sb().auth.signOut()} className="mt-2 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"><LogOut className="size-3.5" />Sign out</button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:px-8">
          <button type="button" className="rounded-lg p-1.5 hover:bg-muted lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
          <h1 className="m-0 text-lg">{NAV.find((n) => n[0] === view)![1]}</h1>
          <button type="button" onClick={() => dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))} className="ml-auto hidden items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-[13px] text-muted-foreground hover:border-brand md:flex">Search everything <kbd className="rounded border border-border bg-card px-1.5 text-[11px]">Ctrl K</kbd></button>
          <a href={import.meta.env.BASE_URL} target="_blank" rel="noreferrer" className="text-[13px] text-brand md:ml-0 ml-auto">View website ↗</a>
        </header>
        <main className="mx-auto max-w-7xl p-4 lg:p-8"><Page go={setView} owner={owner} me={email} /></main>
        <CommandBar go={setView} pages={NAV.map(([v, l]) => [v, l])} />
      </div>
    </div>
  )
}

export type PageProps = { go: (v: View) => void; owner: boolean; me: string }
