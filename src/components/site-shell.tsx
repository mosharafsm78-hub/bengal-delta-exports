import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Menu, X, ShoppingBag, ChevronDown, ArrowRight, Search, Mail, MessageCircle } from 'lucide-react'
import { CATS, FAMILIES } from '@/data/catalog'
import { SITE } from '@/data/site'
import { useBasket } from '@/lib/quote-basket'
import { cn } from '@/lib/utils'
import { catStyle } from '@/lib/cat-style'

const PRIMARY = [
  { to: '/how-we-work', label: 'How to order' },
  { to: '/about', label: 'About us' },
  { to: '/faq', label: 'FAQ' },
] as const

const GUIDES = [
  { to: '/prices', label: 'Price list' },
  { to: '/duty-free-markets', label: 'Duty-free markets' },
  { to: '/shipping', label: 'Shipping and transit' },
  { to: '/season-calendar', label: 'Season calendar' },
  { to: '/quality', label: 'Quality and certificates' },
] as const

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" aria-hidden="true" className="flex-none">
      <rect width="38" height="38" rx="8" className="fill-brand" />
      <path d="M8 27 C14 20, 19 24, 30 10" className="stroke-brand-ink" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M8 31 C15 25, 21 28, 30 18" className="stroke-jute" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

const navLink = 'whitespace-nowrap rounded-md px-3 py-2 text-[14.5px] font-medium text-foreground no-underline hover:bg-muted'

function useCloseOnRoute(close: () => void) {
  const path = useRouterState({ select: (s) => s.location.href })
  useEffect(() => close(), [path]) // eslint-disable-line react-hooks/exhaustive-deps
}

function Dropdown({ label, id, children, wide }: { label: string; id: string; children: React.ReactNode; wide?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useCloseOnRoute(() => setOpen(false))
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])
  return (
    <div ref={ref} className={wide ? '' : 'relative'} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className={cn(navLink, 'inline-flex items-center gap-1', open && 'bg-muted')} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {label} <ChevronDown className={cn('size-4 transition', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <div id={id} className={cn('absolute z-40 pt-2', wide ? 'inset-x-0 top-full' : 'top-full left-0')}>
          {children}
        </div>
      )}
    </div>
  )
}

function ProductsMenu() {
  const cols = [['garments'], ['produce', 'footwear'], ['food', 'home'], ['jute', 'crafts']]
  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_16rem] gap-8 rounded-xl border border-border bg-card p-6 shadow-xl">
        {cols.map((ids) => (
          <div key={ids[0]} className="grid content-start gap-5">
            {ids.map((cid) => {
              const c = CATS.find((x) => x.id === cid)!
              return (
                <div key={cid}>
                  <Link to="/products" search={{ cat: c.id }} style={catStyle(c.id)} className="cat-text text-[12px] font-semibold tracking-[0.12em] uppercase no-underline hover:underline">{c.name}</Link>
                  <ul className="mt-2 grid list-none gap-0.5 p-0">
                    {FAMILIES.filter((f) => f.cat === cid).map((f) => (
                      <li key={f.id}>
                        <Link to="/products/$familyId" params={{ familyId: f.id }} className="-mx-1.5 block rounded px-1.5 py-1 text-[14.5px] text-foreground no-underline hover:bg-muted hover:text-brand">
                          {f.name} <span className="num text-xs text-muted-foreground">{f.styles.length}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        ))}
        <div className="flex flex-col gap-3 rounded-lg bg-brand-soft p-4">
          <h4 className="m-0 text-base">Buyer guides</h4>
          <ul className="m-0 grid list-none gap-1 p-0">
            {GUIDES.map((g) => <li key={g.to}><Link to={g.to} className="text-[14px] text-foreground no-underline hover:text-brand">{g.label}</Link></li>)}
          </ul>
          <h4 className="m-0 mt-2 text-base">Can't find it?</h4>
          <p className="m-0 text-sm text-muted-foreground">We source anything made or grown in Bangladesh. Tell us the product, spec and quantity.</p>
          <Link to="/quote" search={{ tab: 'requirement' }} className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand no-underline">Send a requirement <ArrowRight className="size-4" aria-hidden="true" /></Link>
          <Link to="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-brand no-underline">All products <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  )
}

function HeaderSearch({ onDone }: { onDone?: () => void }) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault()
        void navigate({ to: '/products', search: { q: q.trim() || undefined } })
        setQ('')
        onDone?.()
      }}
    >
      <label htmlFor="header-search" className="sr-only">Search products</label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input id="header-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="w-full rounded-full border border-input bg-paper py-2 pr-3 pl-9 text-[14px] outline-none focus:border-brand xl:w-52" />
    </form>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const items = useBasket()
  useCloseOnRoute(() => setOpen(false))
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2">Skip to content</a>
      <header className="sticky top-0 z-30 print:hidden border-b border-border bg-card/95 backdrop-blur">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-5">
          <Link to="/" className="flex flex-none items-center gap-2.5 text-foreground no-underline" aria-label={`${SITE.name} home`}>
            <Logo />
            <span className="leading-none">
              <span className="block font-display text-[17px] font-semibold tracking-tight sm:text-[19px]">{SITE.name}</span>
              <span className="mt-1 hidden text-[10.5px] font-medium tracking-[0.12em] text-muted-foreground uppercase sm:block">Bangladesh export hub</span>
            </span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
            <Dropdown label="Products" id="menu-products" wide>
              <ProductsMenu />
            </Dropdown>
            {PRIMARY.map((n) => (
              <Link key={n.to} to={n.to} className={navLink} activeProps={{ className: 'bg-muted text-brand' }}>{n.label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden xl:block"><HeaderSearch /></div>
            <Link to="/quote" className="btn btn-primary px-3 py-2.5 text-[14.5px] sm:px-4">
              <ShoppingBag className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Get a free quote</span>
              <span className="sm:hidden">Quote</span>
              {items.length > 0 && <span className="num rounded-full bg-brand-ink px-1.5 text-xs text-brand">{items.length}</span>}
            </Link>
            <button type="button" className="rounded-md border border-border bg-card p-2 lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Main" className="max-h-[78vh] overflow-y-auto border-t border-border bg-card px-4 pt-4 pb-6 lg:hidden">
            <HeaderSearch onDone={() => setOpen(false)} />
            <div className="eyebrow mt-5 mb-1">Products</div>
            <div className="grid grid-cols-2 gap-x-2">
              {CATS.map((c) => (
                <Link key={c.id} to="/products" search={{ cat: c.id }} className="rounded-md py-2 text-[15px] font-medium text-foreground no-underline">{c.name}</Link>
              ))}
            </div>
            <div className="eyebrow mt-4 mb-1">Buyer guide</div>
            <div className="grid grid-cols-2 gap-x-2">
              {[...PRIMARY, ...GUIDES].map((n) => (
                <Link key={n.to} to={n.to} className="rounded-md py-2 text-[15px] font-medium text-foreground no-underline">{n.label}</Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  )
}

/** Small contact strip shown at the end of product pages and in the footer. */
export function ContactLinks({ text, className }: { text?: string; className?: string }) {
  const wa = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text ?? `Hello ${SITE.name}, I have a question.`)}` : ''
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      <a href={`mailto:${SITE.email}?subject=${encodeURIComponent(text ?? 'Inquiry')}`} className="btn btn-outline"><Mail className="size-4" aria-hidden="true" /> Email sales</a>
      {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><MessageCircle className="size-4" aria-hidden="true" /> WhatsApp</a>}
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink print:hidden text-[14.5px] text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="font-display text-xl font-semibold">{SITE.name}</span>
          </div>
          <p className="mt-4 max-w-sm opacity-75">An export trading house in Chattogram, Bangladesh. Garments, footwear, home textiles, jute, fresh produce, food and handicrafts, shipped FOB, CFR or CIF worldwide.</p>
          <Link to="/quote" className="btn mt-5 bg-paper text-ink">Get a free quote <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <div>
          <h4 className="mb-3 text-[13px] font-semibold tracking-[0.12em] uppercase opacity-60">Products</h4>
          <ul className="m-0 grid list-none gap-2 p-0">
            {CATS.map((c) => (
              <li key={c.id}><Link to="/products" search={{ cat: c.id }} className="text-paper no-underline opacity-85 hover:opacity-100">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-[13px] font-semibold tracking-[0.12em] uppercase opacity-60">Buyer guide</h4>
          <ul className="m-0 grid list-none gap-2 p-0">
            {[...PRIMARY, ...GUIDES].map((n) => (
              <li key={n.to}><Link to={n.to} className="text-paper no-underline opacity-85 hover:opacity-100">{n.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-[13px] font-semibold tracking-[0.12em] uppercase opacity-60">Contact</h4>
          <ul className="m-0 grid list-none gap-2 p-0 opacity-85">
            <li><a href={`mailto:${SITE.email}`} className="text-paper no-underline">{SITE.email}</a></li>
            {SITE.whatsappDisplay && <li>WhatsApp {SITE.whatsappDisplay}</li>}
            {SITE.offices.map((o) => <li key={o}>{o}</li>)}
            <li>{SITE.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-4 py-5 text-[13px] opacity-60">
          <span>© 2026 {SITE.name}. Prices are indicative and confirmed only by a signed proforma invoice. Duty and route information updated {SITE.updated}.</span>
          <Link to="/photo-credits" className="text-paper">Photo credits</Link>
        </div>
      </div>
    </footer>
  )
}

export function PageHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <div className="eyebrow mb-3">{eyebrow}</div>
      <h1 className="m-0 text-[clamp(2rem,4.2vw,3rem)]">{title}</h1>
      {lead && <p className="mt-4 max-w-[64ch] text-[17px] leading-relaxed text-muted-foreground">{lead}</p>}
    </div>
  )
}

export function Pill({ tone = 'brand', children }: { tone?: 'brand' | 'jute' | 'warn' | 'ok' | 'danger'; children: React.ReactNode }) {
  const map = {
    brand: 'bg-brand-soft text-brand',
    jute: 'bg-jute-soft text-jute',
    warn: 'bg-warn-soft text-warn',
    ok: 'bg-ok-soft text-ok',
    danger: 'bg-danger-soft text-danger',
  }
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}>{children}</span>
}

/** Plain table with consistent styling. */
export function DataTable({ cols, rows, className }: { cols: string[]; rows: React.ReactNode[][]; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border bg-card', className)}>
      <table className="w-full border-collapse text-[15px]">
        <thead>
          <tr>{cols.map((c) => <th key={c} className="border-b border-border bg-muted px-4 py-2.5 text-left text-[13px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-border last:border-0">
              {r.map((cell, i) => <td key={i} className={cn('px-4 py-3 align-top', i === 0 && 'font-semibold')}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
