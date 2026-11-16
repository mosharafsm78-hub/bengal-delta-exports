import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FlaskConical, Landmark, Search, ShieldCheck } from 'lucide-react'
import { MAP_H, MAP_W, ORIGIN, PORTS } from '@/data/map-points'
import { CountrySelect } from '@/components/country-select'

const LABELLED = new Set(['Tokyo', 'Sydney', 'Dubai', 'Singapore'])
const route = (x: number, y: number) => {
  const mx = (ORIGIN.x + x) / 2, my = (ORIGIN.y + y) / 2
  const lift = Math.hypot(x - ORIGIN.x, y - ORIGIN.y) * 0.28
  return `M${ORIGIN.x} ${ORIGIN.y} Q${mx} ${my - lift} ${x} ${y}`
}

/** Full-width trade banner: live shipping routes from Bangladesh to buyers' ports, one promise, one action. */
export function HeroBanner() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [country, setCountry] = useState('')
  function go(e: React.FormEvent) {
    e.preventDefault()
    try { if (country) localStorage.setItem('bde-country', country) } catch { /* private mode */ }
    void navigate({ to: '/products', search: { q: q.trim() || undefined } })
  }
  return (
    <section className="relative isolate overflow-hidden bg-[#0b1d19] text-white">
      {/* Map with routes */}
      <svg className="absolute inset-0 -z-10 h-full w-full" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="hb-glow" cx="73%" cy="44%" r="45%"><stop offset="0" stopColor="#14b8a6" stopOpacity=".28" /><stop offset="1" stopColor="#14b8a6" stopOpacity="0" /></radialGradient>
          <linearGradient id="hb-line" x1="1" x2="0"><stop offset="0" stopColor="#5eead4" stopOpacity=".9" /><stop offset="1" stopColor="#5eead4" stopOpacity=".25" /></linearGradient>
        </defs>
        <rect width={MAP_W} height={MAP_H} fill="url(#hb-glow)" />
        <image href="/world-dots.svg" width={MAP_W} height={MAP_H} opacity=".16" />
        {PORTS.map((p, i) => (
          <g key={p.n}>
            <path id={`hb-r${i}`} d={route(p.x, p.y)} fill="none" stroke="url(#hb-line)" strokeWidth="1.6" strokeDasharray="5 7" className="hb-dash" />
            <circle r="3.5" fill="#99f6e4">
              <animateMotion dur={`${5 + (i % 4)}s`} begin={`${(i * 0.7) % 5}s`} repeatCount="indefinite"><mpath href={`#hb-r${i}`} /></animateMotion>
            </circle>
            <circle cx={p.x} cy={p.y} r="4" fill="#5eead4" />
            <circle cx={p.x} cy={p.y} r="4" fill="none" stroke="#5eead4" strokeWidth="1.5"><animate attributeName="r" values="4;14" dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" /><animate attributeName="opacity" values=".8;0" dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" /></circle>
            {LABELLED.has(p.n) && <text x={p.x} y={p.y + 24} textAnchor="middle" fill="#ccfbf1" fillOpacity=".75" fontSize="15" fontWeight="600">{p.n}</text>}
          </g>
        ))}
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r="9" fill="#fbbf24" />
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r="9" fill="none" stroke="#fbbf24" strokeWidth="2"><animate attributeName="r" values="9;30" dur="2.2s" repeatCount="indefinite" /><animate attributeName="opacity" values=".9;0" dur="2.2s" repeatCount="indefinite" /></circle>
        <g transform={`translate(${ORIGIN.x + 18} ${ORIGIN.y + 6})`}><rect x="0" y="-17" width="118" height="30" rx="15" fill="#fbbf24" /><text x="59" y="4" textAnchor="middle" fill="#1c1917" fontSize="15" fontWeight="700">Bangladesh</text></g>
      </svg>
      {/* Readability fade on the text side */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b1d19] via-[#0b1d19]/85 to-transparent lg:via-[#0b1d19]/70" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 pt-16 pb-14 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24">
        <h1 className="m-0 max-w-[15ch] text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.02] font-semibold tracking-tight text-white">
          Buy from Bangladesh. <span className="text-[#5eead4]">Pay only when it ships.</span>
        </h1>
        <p className="mt-5 mb-0 max-w-[46ch] text-[clamp(1.05rem,1.6vw,1.25rem)] text-white/75">Clothing, footwear, textiles, jute and food. Inspected and delivered to your port.</p>

        <form onSubmit={go} role="search" className="mt-8 grid max-w-3xl gap-2 rounded-2xl bg-white p-2 text-ink shadow-2xl sm:grid-cols-[1.4fr_1fr_auto]">
          <label className="relative block">
            <span className="sr-only">What do you want to buy?</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you want to buy?" className="w-full rounded-lg border border-transparent bg-transparent py-3 pr-3 pl-10 text-[16px] outline-none focus:border-brand" />
          </label>
          <div className="sm:border-l sm:border-border sm:pl-2"><CountrySelect value={country} onChange={setCountry} placeholder="Deliver to" className="border-transparent py-3 text-[16px]" /></div>
          <button className="rounded-xl bg-brand px-7 py-3 text-[16px] font-semibold text-white hover:opacity-90">Get prices</button>
        </form>

        <ul className="mt-7 mb-0 flex flex-wrap gap-x-7 gap-y-3 p-0 text-[15px] text-white/85">
          {([[Landmark, 'Your money stays in your bank'], [ShieldCheck, 'Every order inspected'], [FlaskConical, 'Samples in 24 hours']] as const).map(([Icon, t]) => (
            <li key={t} className="flex list-none items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-white/10"><Icon className="size-4 text-[#5eead4]" aria-hidden="true" /></span>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
