import { Link } from '@tanstack/react-router'
import type { Family, Style } from '@/data/types'
import { Photo } from '@/components/photo'
import { slug } from '@/lib/slug'
import { cn } from '@/lib/utils'
import { catStyle } from '@/lib/cat-style'

const MONTH = new Date().getMonth()

export function inSeason(s: Style) {
  return !s.cal || (s.cal[MONTH] ?? 0) >= 1
}

/** One product (e.g. "Bitter gourd") linking to its own page. */
export function ItemTile({ f, s, className, price = true }: { f: Family; s: Style; className?: string; price?: boolean }) {
  const unit = s.u ?? 'pc'
  return (
    <Link
      to="/products/$familyId/$itemId"
      params={{ familyId: f.id, itemId: slug(s.n) }}
      style={catStyle(f.cat)}
      className={cn('group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-foreground no-underline transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md', className)}
    >
      <div className="relative">
        <Photo id={s.photo} alt={s.n} className="aspect-[4/3]" />
        {s.cal && inSeason(s) && <span className="absolute top-2 left-2 rounded-full bg-ok px-2 py-0.5 text-[11px] font-semibold text-card">In season</span>}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <span className="text-[15px] leading-snug font-semibold group-hover:text-brand">{s.n}</span>
        <span className="cat-text mt-0.5 text-xs font-semibold">{f.name}</span>
        {price && <span className="num mt-auto pt-2 text-sm font-semibold">
          ${s.p[0].toFixed(2)}–{s.p[1].toFixed(2)} <span className="font-normal text-muted-foreground">/ {unit}</span>
        </span>}
      </div>
    </Link>
  )
}
