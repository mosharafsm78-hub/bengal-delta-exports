import { useMemo, useState } from 'react'
import { Download, Plus, Search, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PageProps } from './AdminApp'
import { ago, fetchAll, sb, type Contact } from './client'
import { Journey } from './Journey'
import { Notes } from './Notes'
import { csv } from './Leads'
import { Badge, btn, Card, Drawer, Empty, ErrorNote, Field, input, Loading, useAsync } from './ui'

export const INTERESTS = ['garments', 'footwear', 'home-textiles', 'jute', 'produce', 'food', 'crafts'] as const

/** Minimal CSV parser (quoted fields, commas, new lines). */
function parseCsv(text: string) {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++ } else if (ch === '"') q = false; else cell += ch }
    else if (ch === '"') q = true
    else if (ch === ',' || ch === ';' || ch === '\t') { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = '' }
    else cell += ch
  }
  if (cell || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim()))
}

const list = (s?: string) => (s ?? '').split(/[|/]/).map((x) => x.trim().toLowerCase()).filter(Boolean)

export function Contacts({ me }: PageProps) {
  const { data, error, loading, reload } = useAsync(() => fetchAll<Contact>((a, b) => sb().from('bde_contacts').select('*').order('score', { ascending: false }).range(a, b)), [])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('subscribed')
  const [tag, setTag] = useState('')
  const [sel, setSel] = useState<Contact | null>(null)
  const [importing, setImporting] = useState(false)
  const [adding, setAdding] = useState(false)
  const tags = useMemo(() => [...new Set((data ?? []).flatMap((c) => [...c.tags, ...c.interests]))].sort(), [data])
  const rows = useMemo(() => (data ?? []).filter((c) => (status === 'all' || c.status === status) && (!tag || c.tags.includes(tag) || c.interests.includes(tag)) && (!q || `${c.email} ${c.name} ${c.company} ${c.country}`.toLowerCase().includes(q.toLowerCase()))), [data, q, status, tag])
  if (loading && !data) return <Loading />
  if (error) return <ErrorNote error={error} />
  const all = data ?? []
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[['Subscribed', all.filter((c) => c.status === 'subscribed').length], ['Engaged (opened or clicked)', all.filter((c) => c.last_open_at).length], ['From website quotes', all.filter((c) => c.tags.includes('lead')).length], ['Unsubscribed or bounced', all.filter((c) => c.status !== 'subscribed').length]].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-border bg-card p-4"><div className="text-[12.5px] text-muted-foreground">{l}</div><div className="num font-display text-2xl font-bold">{v}</div></div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative"><Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" /><input className={cn(input, 'w-56 pl-8')} placeholder="Search name, company, country" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className={cn(input, 'w-auto')} value={status} onChange={(e) => setStatus(e.target.value)}>{['subscribed', 'unsubscribed', 'bounced', 'all'].map((s) => <option key={s}>{s}</option>)}</select>
        <select className={cn(input, 'w-auto')} value={tag} onChange={(e) => setTag(e.target.value)}><option value="">All tags and interests</option>{tags.map((t) => <option key={t}>{t}</option>)}</select>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => setAdding(true)} className={cn(btn, 'btn-outline')}><Plus className="size-4" />Add</button>
          <button type="button" onClick={() => setImporting(true)} className={cn(btn, 'btn-primary')}><Upload className="size-4" />Import CSV</button>
          <button type="button" onClick={() => csv(rows, 'contacts.csv')} className={cn(btn, 'btn-outline')}><Download className="size-4" /></button>
        </div>
      </div>
      {!rows.length ? <Empty title="No contacts yet">Import your buyer list (CSV from Excel or Google Sheets), add contacts by hand, or let website quote requests add them automatically.</Empty> : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[820px] text-[13.5px]">
            <thead><tr className="border-b border-border bg-muted/60 text-left text-[12px] text-muted-foreground uppercase">{['Contact', 'Country', 'Interests and tags', 'Score', 'Last active', 'Status'].map((h) => <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {rows.slice(0, 500).map((c) => (
                <tr key={c.id} onClick={() => setSel(c)} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-3 py-2.5"><b>{c.company || c.name || c.email}</b><span className="block text-[12px] text-muted-foreground">{c.name ? `${c.name} · ` : ''}{c.email}</span></td>
                  <td className="px-3 py-2.5">{c.country ?? '—'}</td>
                  <td className="px-3 py-2.5"><div className="flex flex-wrap gap-1">{[...c.interests, ...c.tags].slice(0, 5).map((t) => <Badge key={t} tone={t === 'lead' ? 'warn' : 'neutral'}>{t}</Badge>)}</div></td>
                  <td className="num px-3 py-2.5 font-semibold">{c.score}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{ago([c.last_click_at, c.last_visit_at, c.last_open_at].filter(Boolean).sort().pop())}</td>
                  <td className="px-3 py-2.5"><Badge tone={c.status === 'subscribed' ? 'good' : 'bad'}>{c.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 500 && <p className="m-0 px-3 py-2 text-[12.5px] text-muted-foreground">Showing the top 500 of {rows.length}. Use search or filters to narrow down.</p>}
        </div>
      )}
      <Drawer open={importing} onClose={() => setImporting(false)} title="Import contacts"><Importer onDone={() => { setImporting(false); reload() }} /></Drawer>
      <Drawer open={adding} onClose={() => setAdding(false)} title="Add contact"><ContactForm onDone={() => { setAdding(false); reload() }} /></Drawer>
      <Drawer open={!!sel} onClose={() => { setSel(null); reload() }} title={sel?.company || sel?.name || sel?.email}>
        {sel && (
          <div className="grid gap-5">
            <ContactForm contact={sel} onDone={() => { setSel(null); reload() }} />
            <Card title="Journey (emails and website)"><Journey contactId={sel.id} /></Card>
            <Card title="Notes"><Notes entity="contact" id={sel.id} me={me} /></Card>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function ContactForm({ contact, onDone }: { contact?: Contact; onDone: () => void }) {
  const [f, setF] = useState({ email: contact?.email ?? '', name: contact?.name ?? '', company: contact?.company ?? '', country: contact?.country ?? '', phone: contact?.phone ?? '', website: contact?.website ?? '', interests: contact?.interests ?? [], tags: (contact?.tags ?? []).join(', '), status: contact?.status ?? 'subscribed' })
  const [err, setErr] = useState('')
  async function save() {
    setErr('')
    const row = { ...f, email: f.email.trim().toLowerCase(), tags: f.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) }
    const r = contact ? await sb().from('bde_contacts').update(row).eq('id', contact.id) : await sb().from('bde_contacts').insert({ ...row, source: 'manual' })
    if (r.error) setErr(r.error.message); else onDone()
  }
  return (
    <Card title={contact ? 'Details' : undefined}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Email"><input className={input} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Name"><input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Company"><input className={input} value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></Field>
        <Field label="Country"><input className={input} value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} /></Field>
        <Field label="Phone"><input className={input} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Website"><input className={input} value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></Field>
        <Field label="Tags (comma separated)"><input className={input} value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="importer, germany-fair-2026" /></Field>
        <Field label="Status"><select className={input} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{['subscribed', 'unsubscribed', 'bounced'].map((s) => <option key={s}>{s}</option>)}</select></Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {INTERESTS.map((i) => <button key={i} type="button" onClick={() => setF({ ...f, interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i] })} className={cn('rounded-full border px-2.5 py-1 text-[12.5px]', f.interests.includes(i) ? 'border-brand bg-brand-soft text-brand' : 'border-border')}>{i}</button>)}
      </div>
      <ErrorNote error={err} />
      <button type="button" onClick={save} className={cn(btn, 'btn-primary mt-4')}>Save contact</button>
    </Card>
  )
}

function Importer({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState('')
  const [tag, setTag] = useState('')
  const [consent, setConsent] = useState(false)
  const [res, setRes] = useState('')
  const [busy, setBusy] = useState(false)
  const parsed = useMemo(() => {
    const rows = parseCsv(text)
    if (!rows.length) return []
    const head = rows[0].map((h) => h.trim().toLowerCase())
    const hasHead = head.some((h) => h.includes('email'))
    const idx = (n: string[]) => head.findIndex((h) => n.some((x) => h.includes(x)))
    const col = hasHead ? { email: idx(['email']), name: idx(['name', 'contact']), company: idx(['company', 'organisation', 'organization']), country: idx(['country']), phone: idx(['phone', 'mobile']), website: idx(['website', 'url']), interests: idx(['interest', 'category', 'product']), tags: idx(['tag']) } : { email: 0, name: 1, company: 2, country: 3, phone: -1, website: -1, interests: -1, tags: -1 }
    const body = hasHead ? rows.slice(1) : rows
    return body.map((r) => ({
      email: (r[col.email] ?? '').trim().toLowerCase(), name: r[col.name]?.trim() || null, company: r[col.company]?.trim() || null, country: r[col.country]?.trim() || null,
      phone: col.phone >= 0 ? r[col.phone]?.trim() || null : null, website: col.website >= 0 ? r[col.website]?.trim() || null : null,
      interests: col.interests >= 0 ? list(r[col.interests]).filter((x) => (INTERESTS as readonly string[]).includes(x)) : [],
      tags: [...(col.tags >= 0 ? list(r[col.tags]) : []), ...(tag ? [tag.trim().toLowerCase()] : [])], source: 'import',
    })).filter((c) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))
  }, [text, tag])
  async function run() {
    setBusy(true); setRes('')
    let ok = 0
    for (let i = 0; i < parsed.length; i += 500) {
      const { error, data } = await sb().from('bde_contacts').upsert(parsed.slice(i, i + 500), { onConflict: 'email', ignoreDuplicates: true }).select('id')
      if (error) { setRes(error.message); setBusy(false); return }
      ok += data?.length ?? 0
    }
    setBusy(false); setRes(`Imported ${ok} new contacts. ${parsed.length - ok} were already in your list.`)
    setTimeout(onDone, 1500)
  }
  return (
    <div className="grid gap-4">
      <p className="m-0 text-sm text-muted-foreground">Paste rows from Excel or Google Sheets, or choose a CSV file. Columns are detected from the header row: <b>email</b>, name, company, country, phone, website, interests (garments | footwear | jute…), tags.</p>
      <input type="file" accept=".csv,text/csv" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setText(await f.text()) }} />
      <textarea className={cn(input, 'min-h-[180px] font-mono text-[12.5px]')} value={text} onChange={(e) => setText(e.target.value)} placeholder={'email,name,company,country,interests\nbuyer@example.com,Anna Weber,Weber Textil GmbH,Germany,garments|home-textiles'} />
      <Field label="Add a tag to everyone in this import (optional)"><input className={input} value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. heimtextil-2026" /></Field>
      <label className="flex items-start gap-2 text-[13.5px]"><input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />These are business contacts we may email about our products (for example buyers we met, enquiries, or published company purchasing addresses). Every email we send includes an unsubscribe link.</label>
      <div className="flex items-center gap-3">
        <button type="button" disabled={!parsed.length || !consent || busy} onClick={run} className={cn(btn, 'btn-primary disabled:opacity-50')}>{busy ? 'Importing…' : `Import ${parsed.length} contacts`}</button>
        {res && <span className="text-sm">{res}</span>}
      </div>
    </div>
  )
}
