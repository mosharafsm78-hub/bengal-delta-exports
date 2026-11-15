import { createFileRoute, Link } from '@tanstack/react-router'
import { pageHead } from '@/lib/head'
import { FAMILIES } from '@/data/catalog'
import { PageHead } from '@/components/site-shell'
import { slug } from '@/lib/slug'

export const Route = createFileRoute('/season-calendar')({
  head: () => pageHead('/season-calendar'),
  component: Calendar,
})

const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const NOW = new Date().getMonth()

function Calendar() {
  const rows = FAMILIES.filter((f) => f.cat === 'produce').flatMap((f) => f.styles.filter((s) => s.cal).map((s) => ({ f, s })))
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <PageHead eyebrow="Season calendar" title="When fresh produce is available" lead="Teal = available, gold = peak season with the best prices, faded = limited supply. Garments, footwear, jute and packed food are available all year." />
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[760px] border-collapse text-[15px]">
          <thead><tr><th className="border-b border-border bg-muted px-4 py-2.5 text-left text-[13px] font-semibold text-muted-foreground uppercase">Product</th>{M.map((m, i) => <th key={m} className={`w-[6.5%] border-b border-border px-1 py-2.5 text-center text-[13px] font-semibold ${i === NOW ? 'bg-brand text-brand-ink' : 'bg-muted text-muted-foreground'}`}>{m}</th>)}</tr></thead>
          <tbody>
            {rows.map(({ f, s }) => (
              <tr key={s.n} className="border-b border-border last:border-0 hover:bg-paper">
                <td className="px-4 py-2"><Link to="/products/$familyId/$itemId" params={{ familyId: f.id, itemId: slug(s.n) }} className="font-semibold text-foreground no-underline hover:text-brand">{s.n}</Link></td>
                {s.cal!.map((v, i) => {
                  const peak = s.peak?.includes(i + 1)
                  return <td key={i} className="px-1 py-2" title={`${M[i]}: ${v ? (peak ? 'peak' : v < 1 ? 'limited' : 'available') : 'not available'}`}>{v ? <span className={`block h-4 rounded ${peak ? 'bg-jute' : 'bg-brand'}`} style={{ opacity: v < 1 && !peak ? 0.45 : 1 }} /> : null}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Seasons follow the Hortex Foundation list of exportable crops and normal Bangladeshi growing seasons; weather moves them by a few weeks.</p>
    </div>
  )
}
