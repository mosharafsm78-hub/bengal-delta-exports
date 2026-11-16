import { useState } from 'react'
import { CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PageProps } from './AdminApp'
import { sb } from './client'
import { Badge, btn, Card, ErrorNote, Field, input, Loading, useAsync } from './ui'

export function SettingsPage({ owner, me }: PageProps) {
  const team = useAsync(async () => (await sb().from('bde_admins').select('email, name, role, user_id, created_at').order('created_at')).data ?? [], [])
  const settings = useAsync(async () => Object.fromEntries(((await sb().from('bde_settings').select('*')).data ?? []).map((r: any) => [r.key, r.value])), [])
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState('')

  const [invite, setInvite] = useState<{ email: string; code: string } | null>(null)
  async function addMember() {
    setErr('')
    const r = await sb().rpc('bde_invite', { p_email: email.trim().toLowerCase(), p_name: name })
    if (r.error) setErr(r.error.message); else { setInvite({ email: email.trim().toLowerCase(), code: r.data as string }); setEmail(''); setName(''); team.reload() }
  }
  async function saveEmail(v: Record<string, unknown>) {
    const r = await sb().from('bde_settings').update({ value: v, updated_at: new Date().toISOString() }).eq('key', 'email')
    setSaved(r.error ? r.error.message : 'Saved.'); settings.reload()
  }
  if (team.loading && !team.data) return <Loading />
  const es = (settings.data?.email ?? {}) as Record<string, any>

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Team">
        <ul className="m-0 grid list-none gap-2 p-0">
          {(team.data ?? []).map((m: any) => (
            <li key={m.email} className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2 text-[14px]">
              <span className="min-w-0"><b className="block truncate">{m.name || m.email}</b><span className="text-[12.5px] text-muted-foreground">{m.email}</span></span>
              <span className="flex items-center gap-2">
                <Badge tone={m.role === 'owner' ? 'info' : m.user_id ? 'neutral' : 'warn'}>{m.user_id ? m.role : 'invited'}</Badge>
                {owner && m.role !== 'owner' && <button type="button" aria-label={`Remove ${m.email}`} onClick={async () => { await sb().from('bde_admins').delete().eq('email', m.email); team.reload() }} className="rounded p-1 text-muted-foreground hover:bg-card hover:text-[#991b1b]"><Trash2 className="size-4" /></button>}
              </span>
            </li>
          ))}
        </ul>
        {owner ? (
          <div className="mt-4 grid gap-3 border-t border-border pt-4">
            <p className="m-0 text-[13px] text-muted-foreground">Invite a team member. You get a one-time code to send them (WhatsApp is fine). They create an account with that email on this page, then enter the code.</p>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input className={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className={input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button type="button" onClick={addMember} disabled={!email.includes('@')} className={cn(btn, 'btn-primary disabled:opacity-50')}>Invite</button>
            </div>
            <ErrorNote error={err} />
            {invite && <p className="m-0 rounded-lg bg-brand-soft px-4 py-3 text-[14px] text-brand">Invite code for <b>{invite.email}</b>: <b className="num tracking-wider select-all">{invite.code}</b><br /><span className="text-[12.5px]">Shown only once. Send it to them with the link to this page.</span></p>}
          </div>
        ) : <p className="mt-4 mb-0 text-[13px] text-muted-foreground">Only the owner can add or remove team members.</p>}
      </Card>

      <Card title="Go-live checklist for email marketing">
        <ul className="m-0 grid list-none gap-2.5 p-0 text-[14px]">
          {([
            ['Buy the BengalExport domain', !!es.from_email],
            ['Set up a free inbox for replies on the domain', !!es.reply_to],
            ['Create the email-sending account and verify the domain (SPF, DKIM, DMARC)', !!es.connected],
            ['Connect sending to this panel', !!es.connected],
            ['Import your first buyer list', false],
            ['Send a test campaign to yourself', false],
          ] as [string, boolean][]).map(([t, ok]) => <li key={t} className="flex gap-2">{ok ? <CheckCircle2 className="mt-0.5 size-4 flex-none text-brand" /> : <Circle className="mt-0.5 size-4 flex-none text-muted-foreground" />}{t}</li>)}
        </ul>
        <p className="mt-4 mb-0 text-[13px] text-muted-foreground">Claude connects the domain, sending service and DNS records once the domain is bought.</p>
      </Card>

      <EmailSettings key={JSON.stringify(es)} value={es} owner={owner} onSave={saveEmail} saved={saved} />

      <Card title="Your account">
        <p className="m-0 text-[14px]">Signed in as <b>{me}</b>.</p>
        <button type="button" className={cn(btn, 'btn-outline mt-3')} onClick={async () => { await sb().auth.resetPasswordForEmail(me, { redirectTo: location.href.split('#')[0] }); setSaved('Password reset email sent.') }}>Change password</button>
      </Card>
    </div>
  )
}

function EmailSettings({ value, owner, onSave, saved }: { value: Record<string, any>; owner: boolean; onSave: (v: Record<string, unknown>) => void; saved: string }) {
  const [v, setV] = useState(value)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV({ ...v, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value })
  return (
    <Card title={<span className="flex items-center gap-2">Email sending {v.connected ? <Badge tone="good">Connected</Badge> : <Badge tone="warn">Not connected</Badge>}</span>} className="lg:col-span-2">
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Sending service"><select disabled={!owner} className={input} value={v.provider} onChange={set('provider')}><option value="brevo">Brevo (free: 300 emails a day)</option><option value="resend">Resend (free: 100 emails a day)</option></select></Field>
        <Field label="Send from (email on your domain)"><input disabled={!owner} className={input} value={v.from_email ?? ''} onChange={set('from_email')} placeholder="hello@yourdomain.com" /></Field>
        <Field label="Sender name"><input disabled={!owner} className={input} value={v.from_name ?? ''} onChange={set('from_name')} /></Field>
        <Field label="Replies go to"><input disabled={!owner} className={input} value={v.reply_to ?? ''} onChange={set('reply_to')} placeholder="sales@yourdomain.com" /></Field>
        <Field label="Daily sending limit" hint="Matches your plan; the rest of a campaign continues the next day."><input disabled={!owner} type="number" min={1} className={input} value={v.daily_limit ?? 300} onChange={set('daily_limit')} /></Field>
        <Field label="Company address in email footer" hint="Required by anti-spam laws."><input disabled={!owner} className={input} value={v.physical_address ?? ''} onChange={set('physical_address')} /></Field>
      </div>
      {owner && <div className="mt-4 flex items-center gap-3"><button type="button" onClick={() => onSave(v)} className={cn(btn, 'btn-primary')}>Save email settings</button>{saved && <span className="text-sm text-muted-foreground">{saved}</span>}</div>}
      <p className="mt-3 mb-0 text-[12.5px] text-muted-foreground">The secret API key for the sending service is stored on the server, never in this panel. “Connected” switches on once the key is installed and the domain is verified.</p>
    </Card>
  )
}
