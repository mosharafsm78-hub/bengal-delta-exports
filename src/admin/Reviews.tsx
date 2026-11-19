import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { PageProps } from './AdminApp'
import { sb } from './client'
import { btn, Card, ErrorNote, Field, input, useAsync } from './ui'

const SOURCES = [['email', 'Email'], ['whatsapp', 'WhatsApp'], ['call', 'Phone call'], ['visit', 'Visit / meeting'], ['other', 'Other']] as const
const empty = { quote: '', person: '', company: '', show_company: false, country: '', product: '', source: 'email', received_on: '' }

/** Real buyer feedback, pasted word for word from emails or WhatsApp. Published ones show on the website. */
export function Reviews({ me }: PageProps) {
  const { data, reload } = useAsync(async () => (await sb().from('bde_testimonials').select('*').order('created_at', { ascending: false })).data ?? [], [])
  const [f, setF] = useState(empty)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })

  async function save() {
    setErr('')
    if (f.quote.trim().length < 10) return setErr('Paste the buyer’s words (at least one sentence).')
    if (!f.country.trim()) return setErr('Add the buyer’s country.')
    setBusy(true)
    const { error } = await sb().from('bde_testimonials').insert({ ...f, quote: f.quote.trim(), person: f.person.trim() || null, company: f.company.trim() || null, product: f.product.trim() || null, received_on: f.received_on || null, created_by: me })
    setBusy(false)
    if (error) return setErr(error.message)
    setF(empty); reload()
  }
  async function patch(id: number, v: Record<string, unknown>) { await sb().from('bde_testimonials').update(v).eq('id', id); reload() }
  async function remove(id: number) { if (confirm('Delete this review?')) { await sb().from('bde_testimonials').delete().eq('id', id); reload() } }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="m-0 text-2xl">Buyer reviews</h1>
        <p className="mt-1 mb-0 text-[14px] text-muted-foreground">Paste what a buyer actually wrote to you by email or WhatsApp, word for word. Published reviews appear on the homepage under “What buyers say”. Never edit or invent words: importers can tell.</p>
      </div>
      <Card title="Add a review">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Buyer’s words (exactly as written)"><textarea className={cn(input, 'min-h-[110px]')} value={f.quote} onChange={set('quote')} placeholder="Copy the sentence from their email or WhatsApp message" /></Field></div>
          <Field label="Country"><input className={input} value={f.country} onChange={set('country')} placeholder="e.g. Germany" /></Field>
          <Field label="Product they sourced"><input className={input} value={f.product} onChange={set('product')} placeholder="e.g. cotton T-shirts" /></Field>
          <Field label="Name and role (optional)" hint="Shown as written, e.g. “Sourcing manager” or “Thomas, buyer”."><input className={input} value={f.person} onChange={set('person')} /></Field>
          <Field label="Company (optional)" hint="Kept private unless you tick the box below."><input className={input} value={f.company} onChange={set('company')} /></Field>
          <Field label="Where they said it"><select className={input} value={f.source} onChange={set('source')}>{SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <Field label="Date received (optional)"><input type="date" className={input} value={f.received_on} onChange={set('received_on')} /></Field>
          <label className="flex items-center gap-2 text-[13.5px] md:col-span-2"><input type="checkbox" checked={f.show_company} onChange={(e) => setF({ ...f, show_company: e.target.checked })} /> The buyer agreed that we show their company name</label>
        </div>
        <ErrorNote error={err} />
        <button type="button" disabled={busy} onClick={save} className={cn(btn, 'btn-primary mt-3')}>{busy ? 'Saving…' : 'Publish review'}</button>
      </Card>
      <Card title={`Reviews (${data?.length ?? 0})`}>
        {!data?.length ? <p className="m-0 text-[14px] text-muted-foreground">No reviews yet.</p> : (
          <ul className="m-0 grid list-none gap-3 p-0">
            {data.map((t: any) => (
              <li key={t.id} className="rounded-lg border border-border p-3 text-[14px]">
                <div className="whitespace-pre-wrap">“{t.quote}”</div>
                <div className="mt-1.5 text-[12.5px] text-muted-foreground">{[t.person, t.company && `${t.company}${t.show_company ? '' : ' (hidden)'}`, t.country, t.product, t.source].filter(Boolean).join(' · ')}</div>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => patch(t.id, { published: !t.published })} className={cn(btn, t.published ? 'btn-ghost' : 'btn-primary', '!py-1 text-[13px]')}>{t.published ? 'Hide from website' : 'Publish'}</button>
                  <button type="button" onClick={() => remove(t.id)} className={cn(btn, 'btn-ghost !py-1 text-[13px] text-[#b91c1c]')}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
