// Built-in intelligence that runs in the browser with no AI key: lead fit score, next best action,
// automatic insights, subject-line check and best send time.
import type { Lead, WebEvent } from './client'

const FREE_MAIL = /@(gmail|yahoo|hotmail|outlook|live|icloud|aol|proton|mail|gmx|yandex|qq|163)\./i
const DUTY_FREE = ['germany', 'united kingdom', 'uk', 'france', 'netherlands', 'spain', 'italy', 'belgium', 'sweden', 'poland', 'denmark', 'ireland', 'canada', 'australia', 'china', 'japan', 'austria', 'finland', 'portugal']

export type Score = { score: number; grade: 'A' | 'B' | 'C'; reasons: string[] }

/** How promising a quote request looks (0–100), with the reasons. */
export function leadScore(l: Lead, activity = 0): Score {
  let s = 30
  const why: string[] = []
  const qty = Number(String(l.quantity ?? '').replace(/[^\d.]/g, '')) || 0
  const value = Number(l.deal_value_usd) || (l.items ?? []).reduce((a: number, i: any) => a + (Number(String(i.estimate ?? '').replace(/[^\d.]/g, '')) || 0), 0)
  if (value >= 25000) { s += 22; why.push(`Large order (~$${Math.round(value / 1000)}k)`) } else if (value >= 5000) { s += 12; why.push('Solid order size') } else if (qty >= 3000) { s += 10; why.push(`${qty.toLocaleString('en-US')} units requested`) }
  if (l.email && !FREE_MAIL.test(l.email)) { s += 10; why.push('Company email domain') } else why.push('Free email address (verify the company)')
  if (l.company && l.company !== '-') s += 5
  if (l.website) { s += 6; why.push('Has a company website') }
  if (/importer|wholesal|brand|retail|supermarket/i.test(l.buyer_type ?? '')) { s += 8; why.push(`Buyer type: ${l.buyer_type}`) }
  if (DUTY_FREE.includes(String(l.country ?? '').toLowerCase())) { s += 7; why.push(`${l.country}: 0% duty for Bangladesh goods`) }
  if (l.port) s += 3
  if (l.needed_by) { s += 4; why.push(`Needed by ${l.needed_by}`) }
  if ((l.items ?? []).length > 1) { s += 4; why.push(`${l.items.length} products in one request`) }
  if (activity >= 10) { s += 8; why.push('Very active on the website') } else if (activity >= 3) s += 4
  s = Math.max(0, Math.min(100, s))
  return { score: s, grade: s >= 70 ? 'A' : s >= 50 ? 'B' : 'C', reasons: why }
}

const daysSince = (iso?: string | null) => (iso ? (Date.now() - new Date(iso).getTime()) / 864e5 : 999)

/** The single most useful next step for a deal. */
export function nextAction(l: Lead): { text: string; urgent: boolean } {
  const idle = daysSince(l.last_activity_at ?? l.created_at)
  switch (l.stage) {
    case 'New request': return { text: idle > 1 ? 'Reply now — buyers who wait more than 24 h often go elsewhere' : 'Reply within 24 hours with a proforma or clarifying questions', urgent: idle > 0.5 }
    case 'Contacted': return { text: idle > 3 ? 'Send the proforma invoice with prices to their port' : 'Confirm specs, quantity and port, then send the proforma', urgent: idle > 3 }
    case 'Offer sent': return { text: idle > 4 ? 'Follow up: offer samples in 24 hours to move them forward' : 'Wait for feedback; follow up in a few days', urgent: idle > 4 }
    case 'Samples': return { text: idle > 7 ? 'Ask for sample feedback and the go-ahead to open the LC' : 'Track the courier and share the tracking link', urgent: idle > 7 }
    case 'LC opened': return { text: 'Check the LC wording against the proforma and confirm acceptance', urgent: idle > 2 }
    case 'In production': return { text: 'Send progress photos to the buyer', urgent: idle > 7 }
    case 'Shipped': return { text: 'Share the B/L and tracking; present documents to the bank', urgent: false }
    case 'Won': return { text: 'Ask for a repeat order or a referral', urgent: false }
    default: return { text: 'Closed', urgent: false }
  }
}

export type Insight = { tone: 'good' | 'warn' | 'info'; text: string }

/** Plain-language findings from the last weeks of data. */
export function insights(leads: Lead[], web: WebEvent[], sends: { open_count: number; click_count: number; status: string; first_open_at?: string | null }[], suppliers: { stage: string; created_at: string }[]): Insight[] {
  const out: Insight[] = []
  const wk = Date.now() - 7 * 864e5, wk2 = Date.now() - 14 * 864e5
  const pv = web.filter((e) => e.kind === 'product_view')
  const thisW = new Map<string, number>(), lastW = new Map<string, number>()
  for (const e of pv) { const t = new Date(e.created_at).getTime(); const k = e.category ?? ''; if (t >= wk) thisW.set(k, (thisW.get(k) ?? 0) + 1); else if (t >= wk2) lastW.set(k, (lastW.get(k) ?? 0) + 1) }
  const rising = [...thisW.entries()].map(([k, v]) => [k, v, lastW.get(k) ?? 0] as const).filter(([, v, p]) => v >= 5 && v > p * 1.4).sort((a, b) => b[1] - b[2] - (a[1] - a[2]))[0]
  if (rising) out.push({ tone: 'good', text: `Interest in ${rising[0].replace(/-/g, ' ')} is rising: ${rising[1]} product views this week vs ${rising[2]} last week. A focused email to buyers interested in this category could convert now.` })
  const visitors = new Set(web.map((e) => e.visitor_id)).size
  const quoters = new Set(web.filter((e) => e.kind === 'quote_submitted').map((e) => e.visitor_id)).size
  const ctas = new Set(web.filter((e) => e.kind === 'cta_click').map((e) => e.visitor_id)).size
  if (ctas >= 5 && quoters / Math.max(1, ctas) < 0.25) out.push({ tone: 'warn', text: `${ctas} visitors clicked a quote button but only ${quoters} finished the request. Shortening the quote form or offering WhatsApp first could recover these buyers.` })
  if (visitors >= 20) out.push({ tone: 'info', text: `${visitors} people visited in this period and ${quoters} sent a request (${Math.round((quoters / visitors) * 1000) / 10}% conversion). B2B export sites typically convert 1–3%.` })
  const stale = leads.filter((l) => !['Won', 'Lost'].includes(l.stage) && daysSince(l.last_activity_at ?? l.created_at) > 5)
  if (stale.length) out.push({ tone: 'warn', text: `${stale.length} open deal${stale.length > 1 ? 's have' : ' has'} had no activity for over 5 days. Deals that go quiet rarely close; a short follow-up today keeps them alive.` })
  const unanswered = leads.filter((l) => l.stage === 'New request' && daysSince(l.created_at) > 1).length
  if (unanswered) out.push({ tone: 'warn', text: `${unanswered} quote request${unanswered > 1 ? 's are' : ' is'} more than 24 hours old without a reply.` })
  const sent = sends.filter((s) => s.status === 'sent')
  if (sent.length >= 30) {
    const best = bestSendHour(sent)
    if (best) out.push({ tone: 'info', text: `Your emails are opened most around ${best}:00 (Bangladesh time). Schedule the next campaign for that hour.` })
    const rate = sent.filter((s) => s.open_count).length / sent.length
    if (rate < 0.15) out.push({ tone: 'warn', text: `Open rate is ${Math.round(rate * 100)}%. Test shorter subject lines with the buyer's company name, and clean addresses that never open.` })
  }
  const stuck = suppliers.filter((s) => !['approved', 'rejected'].includes(s.stage) && daysSince(s.created_at) > 7).length
  if (stuck) out.push({ tone: 'warn', text: `${stuck} supplier application${stuck > 1 ? 's have' : ' has'} been waiting more than a week. Quick checks keep good factories interested.` })
  const byCountry = new Map<string, number>(); for (const l of leads) byCountry.set(l.country, (byCountry.get(l.country) ?? 0) + 1)
  const topC = [...byCountry.entries()].sort((a, b) => b[1] - a[1])[0]
  if (topC && topC[1] >= 3) out.push({ tone: 'good', text: `${topC[0]} is your strongest market so far with ${topC[1]} quote requests. Consider a campaign just for ${topC[0]} buyers.` })
  if (!out.length) out.push({ tone: 'info', text: 'Insights appear here automatically as visits, emails and quote requests come in.' })
  return out.slice(0, 6)
}

export function bestSendHour(sent: { first_open_at?: string | null }[]) {
  const h = new Map<number, number>()
  for (const s of sent) if (s.first_open_at) { const hr = Number(new Date(s.first_open_at).toLocaleString('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Dhaka' })); h.set(hr, (h.get(hr) ?? 0) + 1) }
  const top = [...h.entries()].sort((a, b) => b[1] - a[1])[0]
  return top ? top[0] : null
}

const SPAM = /\b(free|guarantee|winner|urgent|act now|100% free|cash|cheap|click here|limited time|risk[- ]free|\$\$\$)\b/i

/** Quick quality check for a subject line. */
export function subjectCheck(subject: string): { score: number; tips: string[] } {
  const tips: string[] = []
  let s = 100
  const len = subject.replace(/\{\{[^}]+\}\}/g, 'Weber Textil').length
  if (len > 60) { s -= 20; tips.push(`Long (${len} characters). Phones cut subjects after ~45 characters.`) }
  if (len < 15) { s -= 15; tips.push('Very short. Say what is in it for the buyer.') }
  if (!/\{\{\s*(company|first_name|country)\s*\}\}/.test(subject)) { s -= 15; tips.push('Add {{company}} or {{first_name}}: personalised subjects get opened more.') }
  if (SPAM.test(subject)) { s -= 25; tips.push('Contains words spam filters dislike (free, cheap, urgent…).') }
  if (/[A-Z]{5,}/.test(subject)) { s -= 10; tips.push('Avoid words in ALL CAPS.') }
  if ((subject.match(/!/g) ?? []).length > 1) { s -= 10; tips.push('Use at most one exclamation mark.') }
  if (!tips.length) tips.push('Good subject line.')
  return { score: Math.max(0, s), tips }
}

export type Driver = { factor: string; buyers: number; others: number; lift: number }

/** What visitors who sent a quote request did differently from those who did not. */
export function buyingDrivers(ev: WebEvent[]): { drivers: Driver[]; buyers: number; others: number } {
  const byVisitor = new Map<string, Set<string>>()
  const buyerIds = new Set(ev.filter((e) => e.kind === 'quote_submitted').map((e) => e.visitor_id))
  const host = (r: string | null) => { try { return r ? new URL(r).hostname.replace(/^www\./, '') : null } catch { return null } }
  for (const e of ev) {
    if (!byVisitor.has(e.visitor_id)) byVisitor.set(e.visitor_id, new Set())
    const f = byVisitor.get(e.visitor_id)!
    if (e.kind === 'quote_submitted') continue
    if (e.kind === 'section_view' && e.label) f.add(`Read “${e.label}”`)
    if (e.kind === 'product_view' && e.category) f.add(`Viewed ${e.category.replace(/-/g, ' ')} products`)
    if (e.kind === 'page_view' && e.path && !['/', '/quote', '/quote/'].includes(e.path)) f.add(`Visited ${e.path}`)
    if (e.kind === 'whatsapp_click') f.add('Clicked WhatsApp')
    if (e.kind === 'cta_click' && /sample/i.test(e.label ?? '')) f.add('Looked at samples')
    if (e.utm_source === 'email') f.add('Came from our email')
    const h = host(e.referrer); if (h) f.add(`Came from ${h}`)
    if (e.device) f.add(`Uses ${e.device}`)
  }
  const nb = Math.max(1, [...byVisitor.keys()].filter((v) => buyerIds.has(v)).length)
  const no = Math.max(1, [...byVisitor.keys()].filter((v) => !buyerIds.has(v)).length)
  const counts = new Map<string, [number, number]>()
  for (const [v, fs] of byVisitor) for (const f of fs) { const c = counts.get(f) ?? [0, 0]; if (buyerIds.has(v)) c[0]++; else c[1]++; counts.set(f, c) }
  const drivers = [...counts.entries()].map(([factor, [b, o]]) => ({ factor, buyers: b / nb, others: o / no, lift: (b / nb + 0.01) / (o / no + 0.01) }))
    .filter((d) => d.buyers >= 0.2 && d.lift > 1.3).sort((a, b) => b.lift - a.lift).slice(0, 8)
  return { drivers, buyers: buyerIds.size, others: no }
}
