import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { CountrySelect } from '@/components/country-select'
import { submitLead, type LeadPayload } from '@/lib/leads'

/** Short price request on a product page: five fields, one click. */
export function QuickQuote({ familyId, familyName, unit }: { familyId: string; familyName: string; unit: string }) {
  const [f, setF] = useState({ name: '', company: '', email: '', quantity: '', country: '', hp: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ref, setRef] = useState('')
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: e.target.value }))

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (f.hp) return
    if (!f.name.trim() || !f.company.trim()) return setError('Please enter your name and company.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return setError('Please enter a valid email so we can send your price.')
    if (!f.country) return setError('Please choose the destination country.')
    const reference = `BDE-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const p: LeadPayload = {
      reference, kind: 'quote', items: [{ family: familyId, style: familyName, qty: f.quantity.trim() || undefined }],
      quantity: f.quantity.trim() ? `${f.quantity.trim()} ${unit}` : 'to be advised', country: f.country, incoterm: 'CIF to my port (recommended)',
      certificates: [], company: f.company.trim(), name: f.name.trim(), email: f.email.trim(),
      notes: 'Quick price request from the product page', sourcePage: typeof window !== 'undefined' ? window.location.pathname : undefined, consent: true,
    }
    setBusy(true)
    try { if ((await submitLead(p)) === 'saved') setRef(reference) } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.') } finally { setBusy(false) }
  }

  if (ref) {
    return (
      <div className="mt-6 flex gap-3 rounded-lg border border-ok/30 bg-ok-soft p-4">
        <CheckCircle2 className="mt-0.5 size-5 flex-none text-ok" aria-hidden="true" />
        <p className="m-0 text-[15px]"><b>Request received.</b> Your price for {familyName.toLowerCase()} delivered to {f.country} will reach {f.email} within 24 hours. Reference <b>{ref}</b>.</p>
      </div>
    )
  }
  const input = 'h-11 w-full rounded-md border border-border bg-card px-3 text-[15px] outline-none focus:border-brand'
  return (
    <form onSubmit={send} noValidate className="mt-6 rounded-lg border-2 border-brand/40 bg-card p-4 sm:p-5" aria-label="Quick price request">
      <p className="m-0 font-semibold text-[16px]">Price to your port in 24 hours</p>
      <p className="mt-0.5 mb-3 text-[13.5px] text-muted-foreground">Five fields. No account needed.</p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input className={input} placeholder="Your name" autoComplete="name" value={f.name} onChange={set('name')} aria-label="Your name" />
        <input className={input} placeholder="Company" autoComplete="organization" value={f.company} onChange={set('company')} aria-label="Company" />
        <input className={input} placeholder="Work email" type="email" autoComplete="email" value={f.email} onChange={set('email')} aria-label="Work email" />
        <input className={input} placeholder={`Quantity (${unit}s)`} inputMode="numeric" value={f.quantity} onChange={set('quantity')} aria-label="Quantity" />
        <div className="sm:col-span-2"><CountrySelect value={f.country} onChange={(v) => setF((x) => ({ ...x, country: v }))} placeholder="Destination country" /></div>
        <input tabIndex={-1} autoComplete="off" className="hidden" value={f.hp} onChange={set('hp')} aria-hidden="true" />
      </div>
      {error && <p className="mt-2 mb-0 text-[13.5px] text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary mt-3 w-full sm:w-auto">{busy ? 'Sending…' : 'Get my price'}</button>
      <p className="mt-2 mb-0 text-[12px] text-muted-foreground">We use these details only to send your quotation.</p>
    </form>
  )
}
