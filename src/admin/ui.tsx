import { useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Card({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-border bg-card p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="m-0 text-[15px] font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Kpi({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'good' | 'warn' }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[12.5px] font-medium text-muted-foreground">{label}</div>
      <div className={cn('num mt-1 font-display text-[26px] leading-tight font-bold', tone === 'warn' && 'text-[#b45309]', tone === 'good' && 'text-brand')}>{value}</div>
      {sub && <div className="mt-0.5 text-[12.5px] text-muted-foreground">{sub}</div>}
    </div>
  )
}

export function Bars({ rows, max = 8, empty = 'No data yet' }: { rows: [string, number][]; max?: number; empty?: string }) {
  const top = rows.slice(0, max)
  const peak = Math.max(1, ...top.map((r) => r[1]))
  if (!top.length) return <p className="m-0 text-sm text-muted-foreground">{empty}</p>
  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      {top.map(([k, v]) => (
        <li key={k} className="grid grid-cols-[1fr_auto] items-center gap-3 text-[13.5px]">
          <div className="relative overflow-hidden rounded-md bg-muted px-2.5 py-1.5">
            <div className="absolute inset-y-0 left-0 bg-brand/15" style={{ width: `${(v / peak) * 100}%` }} />
            <span className={cn('relative block truncate', !k.startsWith('/') && 'first-letter:uppercase')}>{k}</span>
          </div>
          <span className="num w-10 text-right font-semibold">{v}</span>
        </li>
      ))}
    </ul>
  )
}

/** Small daily column chart. */
export function Spark({ series, labels }: { series: { name: string; color: string; values: number[] }[]; labels: string[] }) {
  const peak = Math.max(1, ...series.flatMap((s) => s.values))
  return (
    <div>
      <div className="flex h-36 items-end gap-[3px]">
        {labels.map((l, i) => (
          <div key={l} className="group relative flex h-full flex-1 items-end gap-[1px]" title={`${l}: ${series.map((s) => `${s.name} ${s.values[i]}`).join(', ')}`}>
            {series.map((s) => (
              <div key={s.name} className="flex-1 rounded-t-sm" style={{ height: `${Math.max(2, (s.values[i] / peak) * 100)}%`, background: s.values[i] ? s.color : 'var(--color-muted)' }} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>{labels[0]}</span><span>{labels[labels.length - 1]}</span></div>
      <div className="mt-2 flex gap-4 text-[12px]">{series.map((s) => <span key={s.name} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: s.color }} />{s.name}</span>)}</div>
    </div>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info' }) {
  const t = { neutral: 'bg-muted text-foreground', good: 'bg-[#dcfce7] text-[#166534]', warn: 'bg-[#fef3c7] text-[#92400e]', bad: 'bg-[#fee2e2] text-[#991b1b]', info: 'bg-brand-soft text-brand' }[tone]
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11.5px] font-semibold whitespace-nowrap', t)}>{children}</span>
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" onClick={onClose}>
      <aside className="h-full w-full max-w-2xl overflow-y-auto bg-background shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background px-6 py-4">
          <div className="min-w-0 text-lg font-bold">{title}</div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-muted" aria-label="Close"><X className="size-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </aside>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-[13.5px]">
      <span className="font-semibold">{label}</span>
      {children}
      {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
    </label>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <p className="m-0 font-semibold">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{children}</div>}
    </div>
  )
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, set] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    set((s) => ({ ...s, loading: true }))
    fn().then((data) => live && set({ data, loading: false })).catch((e) => live && set({ error: String(e?.message ?? e), loading: false }))
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  return { ...state, reload: () => setTick((t) => t + 1) }
}

export function Loading() {
  return <div className="grid gap-3">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div>
}

export function ErrorNote({ error }: { error?: string }) {
  if (!error) return null
  return <p className="rounded-lg bg-[#fee2e2] px-4 py-3 text-sm text-[#991b1b]">{error}</p>
}

export const input = 'field !py-2 text-[14px]'
export const btn = 'btn px-3.5 py-2 text-[14px]'
