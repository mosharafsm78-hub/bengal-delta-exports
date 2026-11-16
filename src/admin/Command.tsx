import { useEffect, useMemo, useRef, useState } from 'react'
import { Building2, FileText, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sb } from './client'
import type { View } from './AdminApp'

type Hit = { kind: 'lead' | 'contact' | 'supplier' | 'page'; title: string; sub: string; view: View }

/** Ctrl/Cmd + K: jump anywhere and search quotes, contacts and suppliers. */
export function CommandBar({ go, pages }: { go: (v: View) => void; pages: [View, string][] }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const [data, setData] = useState<Hit[]>([])
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o) } if (e.key === 'Escape') setOpen(false) }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [])
  useEffect(() => {
    if (!open) return
    setQ(''); setIdx(0); setTimeout(() => ref.current?.focus(), 20)
    Promise.all([
      sb().from('bde_leads').select('company, name, country, reference, stage').order('created_at', { ascending: false }).limit(500),
      sb().from('bde_contacts').select('company, name, email, country').order('score', { ascending: false }).limit(2000),
      sb().from('bde_suppliers').select('company, district, stage').limit(500),
    ]).then(([l, c, s]) => setData([
      ...(l.data ?? []).map((x: any) => ({ kind: 'lead' as const, title: x.company !== '-' ? x.company : x.name, sub: `${x.reference} · ${x.country} · ${x.stage}`, view: 'leads' as View })),
      ...(c.data ?? []).map((x: any) => ({ kind: 'contact' as const, title: x.company || x.name || x.email, sub: `${x.email}${x.country ? ` · ${x.country}` : ''}`, view: 'contacts' as View })),
      ...(s.data ?? []).map((x: any) => ({ kind: 'supplier' as const, title: x.company, sub: `${x.district ?? ''} · ${x.stage}`, view: 'suppliers' as View })),
    ]))
  }, [open])

  const hits = useMemo(() => {
    const p: Hit[] = pages.map(([v, label]) => ({ kind: 'page', title: label, sub: 'Go to page', view: v }))
    const s = q.toLowerCase().trim()
    if (!s) return p
    return [...p, ...data].filter((h) => `${h.title} ${h.sub}`.toLowerCase().includes(s)).slice(0, 12)
  }, [q, data, pages])

  if (!open) return null
  const pick = (h: Hit) => { go(h.view); setOpen(false) }
  const Icon = { lead: FileText, contact: User, supplier: Building2, page: Search }
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/40 px-4 pt-[12vh]" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <input ref={ref} value={q} onChange={(e) => { setQ(e.target.value); setIdx(0) }} onKeyDown={(e) => { if (e.key === 'ArrowDown') setIdx((i) => Math.min(i + 1, hits.length - 1)); if (e.key === 'ArrowUp') setIdx((i) => Math.max(i - 1, 0)); if (e.key === 'Enter' && hits[idx]) pick(hits[idx]) }} placeholder="Search buyers, contacts, suppliers or pages…" className="h-14 flex-1 bg-transparent text-[15px] outline-none" />
          <kbd className="rounded border border-border px-1.5 text-[11px] text-muted-foreground">Esc</kbd>
        </div>
        <ul className="m-0 max-h-[50vh] list-none overflow-y-auto p-2">
          {hits.map((h, i) => { const I = Icon[h.kind]; return (
            <li key={`${h.kind}${h.title}${i}`}>
              <button type="button" onMouseEnter={() => setIdx(i)} onClick={() => pick(h)} className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left', i === idx && 'bg-brand-soft')}>
                <I className="size-4 flex-none text-brand" />
                <span className="min-w-0"><b className="block truncate text-[14px]">{h.title}</b><span className="block truncate text-[12px] text-muted-foreground">{h.sub}</span></span>
                <span className="ml-auto text-[11px] text-muted-foreground uppercase">{h.kind}</span>
              </button>
            </li>) })}
          {!hits.length && <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matches</li>}
        </ul>
      </div>
    </div>
  )
}
