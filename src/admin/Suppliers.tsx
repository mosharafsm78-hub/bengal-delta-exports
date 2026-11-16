import { useState } from 'react'
import { Check, Mail, Star, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PageProps } from './AdminApp'
import { ago, fmtTime, sb, SUPPLIER_CHECKS, SUPPLIER_STAGES, type Supplier } from './client'
import { logActivity, Notes } from './Notes'
import { Badge, btn, Card, Drawer, Empty, ErrorNote, Loading, useAsync } from './ui'
import { csv } from './Leads'

const done = (s: Supplier) => SUPPLIER_CHECKS.filter(([k]) => s.checklist?.[k]).length

export function Suppliers({ me }: PageProps) {
  const { data, error, loading, reload } = useAsync(async () => (await sb().from('bde_suppliers').select('*').order('created_at', { ascending: false })).data as Supplier[], [])
  const [sel, setSel] = useState<Supplier | null>(null)
  if (loading && !data) return <Loading />
  if (error) return <ErrorNote error={error} />
  const list = data ?? []
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 max-w-2xl text-sm text-muted-foreground">Every application from the “For suppliers” page lands in <b>Applied</b>. Move it across as you check documents, visit the factory and approve a sample. Only approved suppliers should get orders.</p>
        <button type="button" onClick={() => csv(list, 'suppliers.csv')} className={cn(btn, 'btn-outline')}>Export CSV</button>
      </div>
      {!list.length ? <Empty title="No supplier applications yet">They arrive from the “Become a verified supplier” form on the website.</Empty> : (
        <div className="grid gap-3 overflow-x-auto pb-2 md:grid-cols-3 xl:grid-cols-6">
          {SUPPLIER_STAGES.map(([key, label]) => {
            const col = list.filter((s) => s.stage === key)
            return (
              <div key={key} className="min-w-[220px] rounded-xl bg-muted/70 p-2.5">
                <div className="mb-2 flex items-center justify-between px-1 text-[13px] font-bold">{label}<span className="text-muted-foreground">{col.length}</span></div>
                <div className="grid gap-2">
                  {col.map((s) => (
                    <button key={s.id} type="button" onClick={() => setSel(s)} className="rounded-lg border border-border bg-card p-3 text-left text-[13px] hover:border-brand">
                      <b className="block">{s.company}</b>
                      <span className="block text-muted-foreground">{s.district ?? ''} · {(s.categories ?? []).slice(0, 2).join(', ')}</span>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11.5px] text-muted-foreground">{ago(s.created_at)}</span>
                        <Badge tone={done(s) === SUPPLIER_CHECKS.length ? 'good' : 'neutral'}>{done(s)}/{SUPPLIER_CHECKS.length} checks</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Drawer open={!!sel} onClose={() => { setSel(null); reload() }} title={sel?.company ?? ''}>
        {sel && <SupplierDetail s={sel} me={me} onChange={setSel} />}
      </Drawer>
    </div>
  )
}

function SupplierDetail({ s, me, onChange }: { s: Supplier; me: string; onChange: (s: Supplier) => void }) {
  const [busy, setBusy] = useState(false)
  async function patch(p: Partial<Supplier>, note?: string) {
    setBusy(true)
    const { data } = await sb().from('bde_suppliers').update({ ...p, reviewed_by: me }).eq('id', s.id).select().single()
    if (note) await logActivity('supplier', s.id, me, note)
    setBusy(false); if (data) onChange(data as Supplier)
  }
  const ready = done(s) === SUPPLIER_CHECKS.length
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={s.stage === 'approved' ? 'good' : s.stage === 'rejected' ? 'bad' : 'info'}>{SUPPLIER_STAGES.find((x) => x[0] === s.stage)?.[1]}</Badge>
        <span className="text-[13px] text-muted-foreground">{s.reference} · applied {fmtTime(s.created_at)}</span>
        <a href={`mailto:${s.email}`} className={cn(btn, 'btn-outline ml-auto')}><Mail className="size-4" />Email</a>
      </div>
      <Card title="Move to stage">
        <div className="flex flex-wrap gap-2">
          {SUPPLIER_STAGES.map(([k, label]) => (
            <button key={k} type="button" disabled={busy || s.stage === k || (k === 'approved' && !ready)} title={k === 'approved' && !ready ? 'Complete every check first' : undefined}
              onClick={() => patch({ stage: k, status: label, ...(k === 'approved' ? { approved_at: new Date().toISOString() } : {}) }, `Stage → ${label}`)}
              className={cn('rounded-full border px-3 py-1 text-[13px] font-medium disabled:opacity-50', s.stage === k ? 'border-brand bg-brand text-white' : 'border-border hover:border-brand', k === 'rejected' && s.stage !== k && 'text-[#991b1b]')}>
              {k === 'approved' && <Check className="mr-1 inline size-3.5" />}{k === 'rejected' && <X className="mr-1 inline size-3.5" />}{label}
            </button>
          ))}
        </div>
        {!ready && <p className="mt-3 mb-0 text-[12.5px] text-muted-foreground">Approval unlocks when all {SUPPLIER_CHECKS.length} checks below are done.</p>}
      </Card>
      <Card title={`Verification checklist (${done(s)}/${SUPPLIER_CHECKS.length})`}>
        <ul className="m-0 grid list-none gap-1.5 p-0">
          {SUPPLIER_CHECKS.map(([k, label]) => (
            <li key={k}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[14px] hover:bg-muted">
                <input type="checkbox" className="size-4 accent-[#0f6b5c]" checked={!!s.checklist?.[k]} onChange={(e) => patch({ checklist: { ...s.checklist, [k]: e.target.checked } }, `${label}: ${e.target.checked ? 'done' : 'undone'}`)} />
                {label}
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center gap-1 text-[13px]">Quality rating:
          {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`${n} stars`} onClick={() => patch({ rating: n }, `Rating → ${n}/5`)}><Star className={cn('size-5', (s.rating ?? 0) >= n ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-border')} /></button>)}
        </div>
      </Card>
      <Card title="Application">
        <dl className="m-0 grid grid-cols-[150px_1fr] gap-x-3 gap-y-2 text-[13.5px]">
          {([['Contact', s.contact_name], ['Email', s.email], ['Phone', s.phone], ['District', s.district], ['Business type', s.business_type], ['Categories', (s.categories ?? []).join(', ')], ['Products', s.products], ['Capacity', s.capacity], ['Trade licence', s.has_trade_licence ? 'Yes' : 'No'], ['ERC', s.has_erc ? 'Yes' : 'No'], ['Certificates', (s.certificates ?? []).join(', ')], ['Exported before', s.exported_before], ['Website', s.website], ['Notes', s.notes]] as [string, unknown][]).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd className="m-0 break-words whitespace-pre-wrap">{String(v)}</dd></div>
          ))}
        </dl>
      </Card>
      <Card title="Notes and history"><Notes entity="supplier" id={s.id} me={me} /></Card>
    </div>
  )
}
