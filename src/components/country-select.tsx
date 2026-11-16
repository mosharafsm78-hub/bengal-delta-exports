import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const CODES = 'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VE VN YE ZM ZW'.split(' ')
const TOP = ['GB', 'US', 'DE', 'NL', 'FR', 'CA', 'AU', 'JP', 'AE', 'SA']
const flag = (c: string) => String.fromCodePoint(...[...c].map((ch) => 0x1f1a5 + ch.charCodeAt(0)))
let cache: { code: string; name: string }[] | null = null
export function countries() {
  if (cache) return cache
  let dn: Intl.DisplayNames | null = null
  try { dn = new Intl.DisplayNames(['en'], { type: 'region' }) } catch { /* old browser */ }
  cache = CODES.map((code) => ({ code, name: dn?.of(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name))
  return cache
}

/** Searchable country picker with flags. Value is the English country name. */
export function CountrySelect({ value, onChange, placeholder = 'Country', className, required, id }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; required?: boolean; id?: string }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [hi, setHi] = useState(0)
  const box = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const auto = useId()
  const all = countries()
  const items = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return [...TOP.map((c) => all.find((x) => x.code === c)!).filter(Boolean), ...all.filter((x) => !TOP.includes(x.code))]
    return all.filter((x) => x.name.toLowerCase().includes(s) || x.code.toLowerCase() === s).sort((a, b) => Number(!a.name.toLowerCase().startsWith(s)) - Number(!b.name.toLowerCase().startsWith(s)))
  }, [q, all])
  const current = all.find((x) => x.name === value)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  useEffect(() => { list.current?.children[hi]?.scrollIntoView({ block: 'nearest' }) }, [hi])
  const pick = (name: string) => { onChange(name); setOpen(false); setQ('') }
  return (
    <div ref={box} className="relative">
      <button
        type="button" id={id ?? auto} aria-haspopup="listbox" aria-expanded={open}
        onClick={() => { setOpen(!open); setHi(0) }}
        className={cn('flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-[15px] outline-none focus:border-brand', className)}
      >
        {current ? <><span className="text-[18px] leading-none">{flag(current.code)}</span><span className="flex-1 truncate">{current.name}</span></> : <span className="flex-1 truncate text-muted-foreground">{value || placeholder}</span>}
        <ChevronDown className="size-4 flex-none text-muted-foreground" aria-hidden="true" />
      </button>
      {required && <input tabIndex={-1} className="pointer-events-none absolute inset-0 opacity-0" required value={value} onChange={() => {}} aria-hidden="true" />}
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[260px] overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-xl">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 text-muted-foreground" aria-hidden="true" />
            <input
              autoFocus value={q} placeholder="Type to search" aria-label="Search countries"
              onChange={(e) => { setQ(e.target.value); setHi(0) }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(h + 1, items.length - 1)) }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)) }
                else if (e.key === 'Enter') { e.preventDefault(); if (items[hi]) pick(items[hi].name) }
                else if (e.key === 'Escape') setOpen(false)
              }}
              className="w-full bg-transparent py-2.5 text-[14.5px] outline-none"
            />
          </div>
          <ul ref={list} role="listbox" className="m-0 max-h-64 list-none overflow-y-auto p-1">
            {items.map((x, i) => (
              <li key={x.code} role="option" aria-selected={x.name === value}>
                <button type="button" onMouseEnter={() => setHi(i)} onClick={() => pick(x.name)} className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[14.5px]', i === hi && 'bg-muted', !q && i === TOP.length - 1 && 'mb-1 border-b border-border')}>
                  <span className="text-[18px] leading-none">{flag(x.code)}</span><span className="flex-1">{x.name}</span>{x.name === value && <Check className="size-4 text-brand" />}
                </button>
              </li>
            ))}
            {!items.length && <li className="px-3 py-3 text-[14px] text-muted-foreground">No match. <button type="button" className="font-semibold text-brand" onClick={() => pick(q.trim())}>Use “{q.trim()}”</button></li>}
          </ul>
        </div>
      )}
    </div>
  )
}
