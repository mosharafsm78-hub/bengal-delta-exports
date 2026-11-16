import { useState } from 'react'
import { BadgeCheck, CheckCircle2, Clock, Globe2, Landmark, Send, Ship } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { MARKETS, dutyLine, marketDuty } from '@/data/markets'
import type { CategoryId } from '@/data/types'
import { submitLead } from '@/lib/leads'
import { track } from '@/lib/track'
import { cn } from '@/lib/utils'

const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

/** "Delivered to your country" panel plus a one-step offer request, right on the product page. */
export function QuickOffer({ cat, family, style, qty, unit, estimate, leadMin, leadMax }: { cat: CategoryId; family: string; style: string; qty: number; unit: string; estimate: string; leadMin: number; leadMax: number }) {
  const markets = MARKETS.filter((m) => m.cats.includes(cat))
  const [mid, setMid] = useState(markets[0]?.id ?? '')
  const [other, setOther] = useState('')
  const [form, setForm] = useState({ name: '', company: '', email: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [err, setErr] = useState('')
  const m = markets.find((x) => x.id === mid)
  const days = m ? m.transit.match(/(\d+)\D+(\d+)/) : null
  const now = Date.now()
  const arrive = m && days ? [new Date(now + (leadMin + Number(days[1])) * 864e5), new Date(now + (leadMax + Number(days[2])) * 864e5)] : null
  const country = m ? m.name : other

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!country.trim()) { setErr('Please choose your country.'); return }
    setState('sending'); setErr('')
    try {
      await submitLead({
        kind: 'quote',
        items: [{ family, style, qty: qty > 0 ? `${qty.toLocaleString('en-US')} ${unit}` : undefined, estimate }],
        quantity: qty > 0 ? String(qty) : '-',
        unit,
        country: country.trim(),
        port: m?.ports.split(',')[0],
        incoterm: 'CIF to my port (recommended)',
        certificates: [],
        company: form.company.trim() || '-',
        name: form.name.trim(),
        email: form.email.trim(),
        sourcePage: typeof location !== 'undefined' ? location.pathname : undefined,
        notes: 'Sent from the product page quick offer form',
        consent: true,
      })
      setState('done')
    } catch (x) {
      setErr((x as Error).message); setState('error')
    }
  }

  const field = 'w-full rounded-lg border border-border bg-card px-3 py-2.5 text-[15px] outline-none focus:border-[hsl(var(--c))]'
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/40 px-5 py-4">
        <label htmlFor="qo-country" className="flex items-center gap-2 text-[15px] font-semibold"><Globe2 className="size-5 text-brand" aria-hidden="true" />Where should we deliver?</label>
        <select id="qo-country" value={mid} onChange={(e) => { setMid(e.target.value); track('cta_click', { label: `country:${e.target.value}` }) }} className={cn(field, 'mt-2')}>
          {markets.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          <option value="">Another country</option>
        </select>
        {!m && <input className={cn(field, 'mt-2')} placeholder="Your country" value={other} onChange={(e) => setOther(e.target.value)} aria-label="Your country" />}
        {m && (
          <div className="mt-3 grid gap-2 text-[13.5px] sm:grid-cols-3">
            <div className="rounded-lg bg-card p-2.5 ring-1 ring-border"><Landmark className="mb-1 size-4 text-brand" aria-hidden="true" /><b className="block">{marketDuty(m).zero ? '0% import duty' : 'Duty applies'}</b><span className="text-muted-foreground">{marketDuty(m).proof} included</span></div>
            <div className="rounded-lg bg-card p-2.5 ring-1 ring-border"><Ship className="mb-1 size-4 text-brand" aria-hidden="true" /><b className="block">{m.ports.split(',')[0]}</b><span className="text-muted-foreground">{m.transit}</span></div>
            <div className="rounded-lg bg-card p-2.5 ring-1 ring-border"><Clock className="mb-1 size-4 text-brand" aria-hidden="true" /><b className="block">{arrive ? `${fmt(arrive[0])} – ${fmt(arrive[1])}` : '—'}</b><span className="text-muted-foreground">at your port if you order today</span></div>
          </div>
        )}
        {m && <p className="mt-2 mb-0 text-[12.5px] text-muted-foreground">{dutyLine(m, cat)}</p>}
      </div>
      <div className="px-5 py-4">
        {state === 'done' ? (
          <div className="flex items-start gap-3 rounded-lg bg-brand-soft p-4 text-[14.5px]">
            <CheckCircle2 className="mt-0.5 size-5 flex-none text-brand" aria-hidden="true" />
            <span><b className="block">Request received.</b>Your free offer for {qty > 0 ? `${qty.toLocaleString('en-US')} ${unit} of ` : ''}{style} delivered to {m?.ports.split(',')[0] ?? country} comes by email within 24 hours. Nothing to pay now.</span>
          </div>
        ) : (
          <form onSubmit={send} className="grid gap-2.5">
            <p className="m-0 text-[15px] font-semibold">Get your free offer in 24 hours</p>
            <p className="m-0 -mt-1 text-[13px] text-muted-foreground">No account, no fees, no obligation. Quantity and options from above are included.</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <input className={field} required placeholder="Your name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Your name" />
              <input className={field} placeholder="Company" autoComplete="organization" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} aria-label="Company" />
            </div>
            <input className={field} required type="email" placeholder="Business email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-label="Business email" />
            {err && <p className="m-0 text-[13px] text-danger">{err}</p>}
            <button disabled={state === 'sending'} className="btn btn-primary justify-center py-3"><Send className="size-4" aria-hidden="true" />{state === 'sending' ? 'Sending…' : 'Send me the offer'}</button>
          </form>
        )}
      </div>
      <Link to="/account" hash="signup" className="flex items-center gap-3 border-t border-border bg-brand-soft/60 px-5 py-3 text-[13.5px] text-foreground no-underline hover:bg-brand-soft">
        <BadgeCheck className="size-5 flex-none text-brand" aria-hidden="true" />
        <span><b>Buying regularly?</b> Open a free buyer account: Verified badge, your own sourcing agent and live order tracking.</span>
      </Link>
    </div>
  )
}
