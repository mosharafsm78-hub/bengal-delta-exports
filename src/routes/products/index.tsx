import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Search, ArrowRight } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { CATS, FAMILIES } from '@/data/catalog'
import type { CategoryId } from '@/data/types'
import { Photo } from '@/components/photo'
import { PageHead } from '@/components/site-shell'
import { ItemTile } from '@/components/item-tile'
import { CAT_PHOTO, catStyle } from '@/lib/cat-style'

interface ProductsSearch {
  cat?: CategoryId
  q?: string
}

export const Route = createFileRoute('/products/')({
  validateSearch: (s: Record<string, unknown>): ProductsSearch => ({
    cat: CATS.some((c) => c.id === s.cat) ? (s.cat as CategoryId) : undefined,
    q: typeof s.q === 'string' && s.q.trim() ? s.q.slice(0, 80) : undefined,
  }),
  head: () => pageHead('/products'),
  component: Products,
})

const ORDER: CategoryId[] = ['garments', 'produce', 'footwear', 'food', 'home', 'jute', 'crafts']

function Products() {
  const { cat, q } = Route.useSearch()
  const navigate = useNavigate({ from: '/products/' })
  const query = (q ?? '').toLowerCase().trim()
  const cats = ORDER.map((id) => CATS.find((c) => c.id === id)!)
  const fams = FAMILIES.filter((f) => !cat || f.cat === cat)
  const words = query.split(/\s+/).filter(Boolean)
  const matches = query
    ? fams.flatMap((f) => f.styles.filter((s) => { const hay = `${s.n} ${s.d} ${f.name} ${f.tag}`.toLowerCase(); return words.every((w) => hay.includes(w)) }).map((s) => ({ f, s })))
    : []
  const total = FAMILIES.reduce((n, f) => n + f.styles.length, 0)
  const current = cat ? CATS.find((c) => c.id === cat)! : undefined

  const pill = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[14px] font-medium no-underline transition ${active ? 'border-ink bg-ink text-paper' : 'border-border bg-card text-foreground hover:border-ink'}`

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <PageHead
        eyebrow="Catalogue"
        title={current ? current.name : 'Everything we export'}
        lead={current ? current.blurb : `${FAMILIES.length} product families, ${total} individual products. Indicative FOB prices, updated November 2026. Open any product for its details, quantity calculator and order total.`}
      />

      <div className="sticky top-16 z-20 -mx-4 mb-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:w-80 lg:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="p-search" className="sr-only">Search products</label>
            <input
              id="p-search"
              key={q ?? ''}
              defaultValue={q ?? ''}
              placeholder="Search okra, hoodie, wallet, towel…"
              className="w-full rounded-full border border-input bg-card py-2 pr-3 pl-9 text-[15px] outline-none focus:border-brand"
              onChange={(e) => void navigate({ search: (prev) => ({ ...prev, q: e.target.value.trim() || undefined }), replace: true })}
            />
          </div>
          <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0" role="group" aria-label="Filter by category">
            <Link to="/products" search={{ q }} className={pill(!cat)}>All</Link>
            {cats.map((c) => (
              <Link key={c.id} to="/products" search={{ cat: c.id, q }} className={pill(cat === c.id)}>{c.name}</Link>
            ))}
          </div>
        </div>
      </div>

      {query ? (
        <section className="mb-14">
          <h2 className="mb-5 text-2xl">{matches.length} {matches.length === 1 ? 'product matches' : 'products match'} “{q}”</h2>
          {matches.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {matches.slice(0, 80).map(({ f, s }) => <ItemTile key={f.id + s.n} f={f} s={s} />)}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8">
              <p className="m-0 text-lg">Nothing listed under “{q}” yet, but we can probably source it.</p>
              <Link to="/quote" search={{ tab: 'requirement' }} className="btn btn-primary mt-4">Send your requirement</Link>
            </div>
          )}
        </section>
      ) : (
        <>
          {!cat && (
            <section className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              {cats.map((c) => {
                const n = FAMILIES.filter((f) => f.cat === c.id).reduce((s, f) => s + f.styles.length, 0)
                return (
                  <Link key={c.id} to="/products" search={{ cat: c.id }} style={catStyle(c.id)} className="group overflow-hidden rounded-xl text-foreground no-underline shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-md">
                    <Photo id={CAT_PHOTO[c.id]} alt={c.name} className="aspect-square" />
                    <div className="cat-bg px-3 py-2">
                      <div className="text-[14px] leading-snug font-semibold">{c.name}</div>
                      <div className="num text-[12px] opacity-85">{n} products</div>
                    </div>
                  </Link>
                )
              })}
            </section>
          )}

          {cats.filter((c) => !cat || c.id === cat).map((c) => {
            const list = fams.filter((f) => f.cat === c.id)
            if (!list.length) return null
            const items = list.flatMap((f) => f.styles.map((s) => ({ f, s })))
            return (
              <section key={c.id} id={c.id} className="mb-20 scroll-mt-40" style={catStyle(c.id)}>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-[hsl(var(--c))] pb-4">
                  <div>
                    <h2 className="cat-text m-0 text-[clamp(1.6rem,3vw,2.1rem)]">{c.name}</h2>
                    <p className="mt-1 mb-0 text-muted-foreground">{c.blurb}</p>
                  </div>
                  {!cat && (
                    <Link to="/products" search={{ cat: c.id }} className="inline-flex items-center gap-1 text-[15px] font-semibold text-brand no-underline">
                      All {items.length} products <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((f) => {
                    const lo = Math.min(...f.styles.map((s) => s.p[0]))
                    const hi = Math.max(...f.styles.map((s) => s.p[1]))
                    const unit = f.styles[0].u ?? 'pc'
                    return (
                      <Link key={f.id} to="/products/$familyId" params={{ familyId: f.id }} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-foreground no-underline transition hover:border-brand hover:shadow-md">
                        <Photo id={f.photo} alt={f.name} className="aspect-[16/10]" />
                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className="m-0 text-lg group-hover:text-brand">{f.name}</h3>
                            <span className="num flex-none text-[13px] text-muted-foreground">{f.styles.length} types</span>
                          </div>
                          <p className="mt-1.5 mb-0 text-[14.5px] text-muted-foreground">{f.tag}</p>
                          <div className="mt-auto flex items-baseline justify-between gap-3 border-t border-border pt-3">
                            <span className="num font-semibold">${lo.toFixed(2)}–{hi.toFixed(2)} <span className="text-[13px] font-normal text-muted-foreground">/ {unit} FOB</span></span>
                            <span className="text-right text-[13px] text-muted-foreground">MOQ {f.moq.split('(')[0].trim()}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <h3 className="mt-10 mb-4 text-[13px] tracking-[0.1em] text-muted-foreground uppercase">
                  Every product in {c.name.toLowerCase()} <span className="num">({items.length})</span>
                </h3>
                {cat ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {items.map(({ f, s }) => <ItemTile key={f.id + s.n} f={f} s={s} />)}
                  </div>
                ) : (
                  <div className="scroll-row -mx-4 flex gap-4 overflow-x-auto px-4 pb-3">
                    {items.map(({ f, s }) => <ItemTile key={f.id + s.n} f={f} s={s} className="w-52 flex-none" />)}
                  </div>
                )}
              </section>
            )
          })}

          <section className="mb-8 flex flex-col items-start justify-between gap-4 rounded-lg border border-border bg-card p-8 md:flex-row md:items-center">
            <div>
              <h2 className="m-0 text-2xl">Not on the list?</h2>
              <p className="mt-1 mb-0 text-muted-foreground">We source anything made or grown in Bangladesh. Send the product, spec and quantity.</p>
            </div>
            <Link to="/quote" search={{ tab: 'requirement' }} className="btn btn-primary">Send a requirement</Link>
          </section>
        </>
      )}
    </div>
  )
}
