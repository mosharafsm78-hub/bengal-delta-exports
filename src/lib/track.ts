// Cookieless first-party analytics. A random visitor id lives in localStorage; no personal data is collected
// unless the visitor arrives from one of our emails (link parameter `e`) or sends a quote request.
const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined

const rid = () => (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, '').slice(0, 24)

function store(kind: 'local' | 'session', k: string, make?: () => string) {
  try {
    const s = kind === 'local' ? localStorage : sessionStorage
    let v = s.getItem(k)
    if (!v && make) { v = make(); s.setItem(k, v) }
    return v ?? ''
  } catch {
    return make ? make() : ''
  }
}

export function visitorId() {
  return typeof window === 'undefined' ? '' : store('local', 'bde-v', rid)
}

function campaignParams() {
  if (typeof window === 'undefined') return {}
  const q = new URLSearchParams(location.search)
  const keys = ['e', 'utm_source', 'utm_medium', 'utm_campaign'] as const
  const saved: Record<string, string> = JSON.parse(store('session', 'bde-utm') || '{}')
  let changed = false
  for (const k of keys) { const v = q.get(k); if (v) { saved[k] = v; changed = true } }
  if (changed) try { sessionStorage.setItem('bde-utm', JSON.stringify(saved)) } catch { /* private mode */ }
  return saved
}

const isTeam = () => { try { return !!localStorage.getItem('bde-admin-auth') } catch { return false } }
const enabled = () => typeof window !== 'undefined' && !!URL_ && !!KEY && !location.pathname.includes('/admin') && navigator.doNotTrack !== '1' && !isTeam()

export function track(kind: string, extra: { label?: string; product?: string; category?: string } = {}) {
  if (!enabled()) return
  const u = campaignParams()
  const base = (import.meta.env.BASE_URL as string).replace(/\/$/, '')
  const body = {
    p: {
      v: visitorId(), s: store('session', 'bde-s', rid), k: kind,
      p: location.pathname.replace(base, '') || '/', l: extra.label, pr: extra.product, ct: extra.category,
      r: document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : undefined,
      e: u.e, us: u.utm_source, um: u.utm_medium, uc: u.utm_campaign,
      d: innerWidth < 768 ? 'mobile' : innerWidth < 1100 ? 'tablet' : 'desktop',
      lg: navigator.language, tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  }
  try {
    fetch(`${URL_}/rest/v1/rpc/bde_track`, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', apikey: KEY!, Authorization: `Bearer ${KEY}` }, body: JSON.stringify(body) }).catch(() => {})
  } catch { /* never break the page */ }
}

/** Page view plus product context from the URL. */
export function trackPage(path: string) {
  const base = (import.meta.env.BASE_URL as string).replace(/\/$/, '')
  const parts = path.replace(base, '').split('/').filter(Boolean)
  if (parts[0] === 'products' && parts.length >= 3) track('product_view', { category: parts[1], product: parts[2] })
  else if (parts[0] === 'products' && parts.length === 2) track('category_view', { category: parts[1] })
  else track('page_view')
}

let observer: IntersectionObserver | undefined
const seen = new Set<string>()

/** Report which page sections people actually look at, and important clicks. */
export function watchSections(path: string) {
  if (!enabled()) return
  observer?.disconnect()
  seen.clear()
  observer = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const t = (en.target as HTMLElement).innerText.trim().slice(0, 80)
      if (en.isIntersecting && t && !seen.has(t)) { seen.add(t); track('section_view', { label: t }) }
    }
  }, { threshold: 0.6 })
  setTimeout(() => document.querySelectorAll('main h2').forEach((h) => observer!.observe(h)), 600)
  void path
}

let clicksBound = false
export function bindClicks() {
  if (clicksBound || typeof document === 'undefined') return
  clicksBound = true
  document.addEventListener('click', (ev) => {
    const el = (ev.target as HTMLElement).closest('a,button') as HTMLElement | null
    if (!el) return
    const href = el.getAttribute('href') ?? ''
    const text = (el.getAttribute('aria-label') || el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80)
    if (href.includes('wa.me')) track('whatsapp_click', { label: text })
    else if (href.startsWith('mailto:')) track('email_click', { label: text })
    else if (href.startsWith('tel:')) track('phone_click', { label: text })
    else if (el.dataset.track) track('click', { label: el.dataset.track })
    else if (/quote|sample|firm price|add to list/i.test(text)) track('cta_click', { label: text })
  }, { capture: true })
}
