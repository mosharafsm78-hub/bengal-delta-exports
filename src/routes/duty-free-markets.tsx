import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { pageHead } from '@/lib/head'
import { DUTY, DUTY_PRESETS } from '@/data/site'
import { DataTable, PageHead, Pill } from '@/components/site-shell'

export const Route = createFileRoute('/duty-free-markets')({
  head: () => pageHead('/duty-free-markets'),
  component: Duty,
})

const tone = { ok: 'ok', watch: 'warn', disrupted: 'danger' } as const

function Duty() {
  const [m, setM] = useState(0)
  const [kind, setKind] = useState<'goods' | 'produce'>('goods')
  const [fob, setFob] = useState('3.00')
  const [qty, setQty] = useState('5000')
  const [freight, setFreight] = useState('1800')
  const preset = DUTY_PRESETS[m][kind === 'goods' ? 1 : 2]
  const [duty, setDuty] = useState<string>(String(DUTY_PRESETS[0][1]))
  const n = (s: string) => parseFloat(s.replace(/,/g, '')) || 0
  const goods = n(fob) * Math.max(1, n(qty))
  const cif = goods + n(freight)
  const dutyAmt = (cif * n(duty)) / 100
  const total = cif + dutyAmt
  const usd = (v: number) => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const label = 'mb-1.5 block text-sm font-semibold'

  const choose = (i: number, k = kind) => {
    setM(i)
    const p = DUTY_PRESETS[i][k === 'goods' ? 1 : 2]
    setDuty(p === null ? '' : String(p))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <PageHead eyebrow="Duty-free markets · updated November 2026" title="What you pay at your border when you buy from Bangladesh" lead="Bangladesh keeps Least Developed Country status until 24 November 2029, so most large markets let its goods in at zero import duty. That is often a 9–20% saving against buying the same item from a non-LDC supplier." />
      <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[['0% duty', 'EU, UK, Canada, Australia', 'Practically every product, including garments and footwear.'], ['0% duty', 'China', 'All tariff lines since 1 December 2024.'], ['0% on most', 'Japan, South Korea, India', "Japan's new trade deal covers about 97% of Bangladesh's exports."], ['Tariff applies', 'USA, Gulf states', 'USA: 19% reciprocal tariff plus normal duty. Gulf: 5%, fresh produce 0%.']].map(([p, t, d], i) => (
          <div key={t} className="rounded-lg border border-border bg-card p-6">
            <Pill tone={i === 3 ? 'warn' : 'ok'}>{p}</Pill>
            <h2 className="mt-3 mb-1 font-sans text-lg font-semibold tracking-normal">{t}</h2>
            <p className="m-0 text-[15px] text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
      <DataTable
        cols={['Market', 'Import duty on Bangladeshi goods', 'Scheme and how long it lasts', 'Proof of origin we supply', 'Shipping now']}
        rows={DUTY.map((d) => [d.market, <Pill tone={d.zero ? 'ok' : 'warn'}>{d.duty}</Pill>, d.scheme, <span className="text-sm">{d.proof}</span>, <Pill tone={tone[d.status]}>{d.statusText}</Pill>])}
      />
      <p className="mt-3 text-sm text-muted-foreground">General guidance as of November 2026, not legal advice. Your customs broker confirms the rate for your exact HS code. Duty is usually charged on the CIF value.</p>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-7">
          <h2 className="mt-0 mb-1 text-2xl">Landed cost calculator</h2>
          <p className="mb-5 text-muted-foreground">Estimate what one unit costs you at your port, duty included.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="c-m" className={label}>Your market</label><select id="c-m" className="field" value={m} onChange={(e) => choose(Number(e.target.value))}>{DUTY_PRESETS.map((d, i) => <option key={d[0]} value={i}>{d[0]}</option>)}</select></div>
            <div><label htmlFor="c-k" className={label}>Product type</label><select id="c-k" className="field" value={kind} onChange={(e) => { const k = e.target.value as 'goods' | 'produce'; setKind(k); choose(m, k) }}><option value="goods">Garments, footwear, jute, textiles, food</option><option value="produce">Fresh vegetables or fruit</option></select></div>
            <div><label htmlFor="c-f" className={label}>FOB price per unit (USD)</label><input id="c-f" inputMode="decimal" className="field" value={fob} onChange={(e) => setFob(e.target.value)} /></div>
            <div><label htmlFor="c-q" className={label}>Units</label><input id="c-q" inputMode="numeric" className="field" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
            <div><label htmlFor="c-fr" className={label}>Freight + insurance, total (USD)</label><input id="c-fr" inputMode="decimal" className="field" value={freight} onChange={(e) => setFreight(e.target.value)} /></div>
            <div><label htmlFor="c-d" className={label}>Import duty %</label><input id="c-d" inputMode="decimal" className="field" value={duty} placeholder={preset === null ? 'Enter your rate' : ''} onChange={(e) => setDuty(e.target.value)} /></div>
          </div>
          <dl className="num mt-6 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-[15px]">
            <dt>Goods (FOB)</dt><dd className="m-0 text-right font-semibold">{usd(goods)}</dd>
            <dt>Freight + insurance</dt><dd className="m-0 text-right font-semibold">{usd(n(freight))}</dd>
            <dt>CIF value</dt><dd className="m-0 text-right font-semibold">{usd(cif)}</dd>
            <dt>Import duty ({n(duty)}%)</dt><dd className="m-0 text-right font-semibold">{usd(dutyAmt)}</dd>
            <dt className="border-t border-border pt-2 font-semibold">Landed cost</dt><dd className="m-0 border-t border-border pt-2 text-right font-semibold">{usd(total)}</dd>
            <dt>Per unit</dt><dd className="m-0 text-right font-display text-2xl font-semibold text-brand">{usd(total / Math.max(1, n(qty)))}</dd>
          </dl>
          <p className="mt-3 mb-0 text-xs text-muted-foreground">Duty fills in from the table and can be overwritten. For the USA, add your normal MFN rate to the 19%. Excludes VAT/GST, which businesses usually reclaim.</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-7">
          <h2 className="mt-0 text-2xl">Why prices stay low at our end</h2>
          <ul className="mt-4 grid gap-3 pl-5 text-[15px]">
            <li><b>No export duty</b> on almost all goods we sell.</li>
            <li><b>VAT zero-rated</b> on exports, so no Bangladeshi VAT sits inside your price.</li>
            <li><b>Duty-free inputs</b> through bonded warehouses and duty drawback for export factories.</li>
            <li><b>Government export incentives</b> for 43 sectors in FY2026-27, highest for diversified jute, agro-processed food, potato, leather goods and light engineering.</li>
            <li>Our only export-side tax is a 1% source tax on proceeds, already inside the quoted FOB.</li>
          </ul>
          <Link to="/quote" className="btn btn-primary mt-4">Get a duty-free quote</Link>
        </div>
      </div>
    </div>
  )
}
