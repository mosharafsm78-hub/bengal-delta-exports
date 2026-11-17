// BengalExport Autopilot: finds buyers, writes and sends personal outreach, follows up,
// reads replies every morning and reports. Runs from pg_cron; admins can trigger and preview.
// Routes (POST unless noted):
//   /research  find new buyer companies for today's best markets   (cron or admin)
//   /send      send the next batch, in each buyer's business hours (cron or admin)
//   /morning   read replies, match website clicks, email the daily report (cron or admin)
//   /status    readiness and numbers (admin)
//   /preview   plan + 3 sample prospects and one sample email, nothing saved or sent (admin)
//   GET /u     one-click unsubscribe for outreach emails
import { createClient } from 'npm:@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.16'

const URL_ = Deno.env.get('SUPABASE_URL')!
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE = Deno.env.get('BDE_SITE_URL') ?? 'https://bengalexport.online/'
const FN = `${URL_}/functions/v1/bde-autopilot`
const db = createClient(URL_, SERVICE, { auth: { persistSession: false } })
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' }

const SMTP = {
  host: Deno.env.get('OUTREACH_SMTP_HOST') ?? 'mail.privateemail.com',
  port: Number(Deno.env.get('OUTREACH_SMTP_PORT') ?? 465),
  user: Deno.env.get('OUTREACH_EMAIL') ?? '',
  pass: Deno.env.get('OUTREACH_PASSWORD') ?? '',
  imapHost: Deno.env.get('OUTREACH_IMAP_HOST') ?? 'mail.privateemail.com',
  imapPort: Number(Deno.env.get('OUTREACH_IMAP_PORT') ?? 993),
}
const mailboxReady = () => !!(SMTP.user && SMTP.pass)
const aiReady = () => !!(Deno.env.get('GEMINI_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY'))

// ---------- What we sell, to whom, where ----------
type Target = { fam: string; cat: string; label: string; buyers: string; markets: string[] }
// Buyers are everywhere: every market we can reach in English or with a public company email.
const WORLD = ['United States', 'Canada', 'Mexico', 'Brazil', 'Chile', 'Colombia', 'United Kingdom', 'Ireland', 'Netherlands', 'Belgium', 'France', 'Spain', 'Portugal', 'Italy', 'Poland', 'Czech Republic', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Switzerland', 'Greece', 'Turkey', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Israel', 'Egypt', 'South Africa', 'Kenya', 'Nigeria', 'India', 'Sri Lanka', 'Singapore', 'Malaysia', 'Thailand', 'Philippines', 'Indonesia', 'Hong Kong', 'South Korea', 'Japan', 'China', 'Australia', 'New Zealand', 'Germany', 'Austria']
const APPAREL = WORLD
const TARGETS: Target[] = [
  { fam: 'tshirts', cat: 'garments', label: 'cotton T-shirts', buyers: 'promotional merchandise suppliers, uniform and workwear distributors, private-label clothing brands, apparel importers', markets: APPAREL },
  { fam: 'polos', cat: 'garments', label: 'polo shirts', buyers: 'corporate uniform suppliers, workwear distributors, golf and club-wear brands', markets: APPAREL },
  { fam: 'fleece', cat: 'garments', label: 'hoodies and sweatshirts', buyers: 'apparel importers, team-wear and promotional clothing distributors', markets: APPAREL },
  { fam: 'denim', cat: 'garments', label: 'denim jeans and jackets', buyers: 'denim brands, fashion importers and clothing wholesalers', markets: APPAREL },
  { fam: 'kids', cat: 'garments', label: 'babywear and kidswear', buyers: 'babywear and kidswear brands and wholesalers', markets: APPAREL },
  { fam: 'active', cat: 'garments', label: 'activewear and team sportswear', buyers: 'sportswear brands, team-wear and club-kit distributors', markets: APPAREL },
  { fam: 'casual-footwear', cat: 'footwear', label: 'slides, sandals and sneakers', buyers: 'footwear importers and wholesalers, hotel and spa amenity suppliers', markets: APPAREL },
  { fam: 'leather-goods', cat: 'footwear', label: 'leather bags, wallets and belts', buyers: 'leather goods brands, corporate gift suppliers, accessories wholesalers', markets: APPAREL },
  { fam: 'towels', cat: 'home', label: 'towels', buyers: 'hotel and hospitality textile suppliers, home textile importers, spa suppliers', markets: APPAREL },
  { fam: 'bedding', cat: 'home', label: 'bed linen', buyers: 'hotel linen suppliers, home textile importers and wholesalers', markets: APPAREL },
  { fam: 'jute-bags', cat: 'jute', label: 'jute and juco bags', buyers: 'promotional bag suppliers, eco packaging companies, retail packaging distributors', markets: APPAREL },
  { fam: 'jute-decor', cat: 'jute', label: 'jute rugs and home decor', buyers: 'home decor importers, rug wholesalers, interior retailers with own import', markets: APPAREL },
  { fam: 'vegetables', cat: 'produce', label: 'fresh vegetables from Bangladesh', buyers: 'Asian and ethnic grocery importers, fresh produce importers', markets: ['United Kingdom', 'Italy', 'Malaysia', 'Singapore', 'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Oman', 'Netherlands', 'Canada', 'United States', 'Australia'] },
  { fam: 'spices', cat: 'food', label: 'spices and aromatic rice', buyers: 'spice importers, Asian and ethnic food wholesalers', markets: WORLD },
  { fam: 'frozen', cat: 'food', label: 'frozen fish and shrimp', buyers: 'seafood importers, Asian food wholesalers', markets: WORLD },
  { fam: 'handicrafts', cat: 'crafts', label: 'handicrafts and handloom', buyers: 'home decor and fair-trade importers, gift wholesalers', markets: APPAREL },
]
// Who the lead engine looks for. Weighted: companies already buying from Bangladesh come first.
const SEGMENTS: { id: string; label: string; brief: string; w: number }[] = [
  { id: 'bd_importers', label: 'Already buying from Bangladesh', brief: 'companies with clear evidence they already import from Bangladesh: shipment records on ImportYeti, Panjiva or Volza, "made in Bangladesh" products on their site, or Bangladeshi suppliers named in news', w: 45 },
  { id: 'wholesalers', label: 'Importers and wholesalers', brief: 'importers, wholesalers and distributors that buy direct from factories in Asia in container or carton volumes', w: 30 },
  { id: 'brands', label: 'Brands and private label', brief: 'brands and private-label companies that have their own products made by factories in Asia', w: 20 },
  { id: 'retail', label: 'Retail chains', brief: 'large retail chains (dozens of stores or more) with their own sourcing or buying office that imports private-label goods', w: 5 },
]
function pickSegment() { let r = Math.random() * SEGMENTS.reduce((a, s) => a + s.w, 0); for (const s of SEGMENTS) { r -= s.w; if (r <= 0) return s } return SEGMENTS[0] }
const DUTY_FREE = new Set(['United Kingdom', 'Netherlands', 'France', 'Spain', 'Italy', 'Poland', 'Belgium', 'Denmark', 'Sweden', 'Ireland', 'Germany', 'Austria', 'Canada', 'Australia', 'Japan', 'Norway', 'Switzerland', 'New Zealand'])
const UTC_OFFSET: Record<string, number> = { Mexico: -6, Brazil: -3, Chile: -3, Colombia: -5, Portugal: 0, 'Czech Republic': 1, Finland: 2, Greece: 2, Turkey: 3, 'United Arab Emirates': 4, Qatar: 3, Kuwait: 3, Oman: 4, Israel: 2, Egypt: 2, 'South Africa': 2, Kenya: 3, Nigeria: 1, India: 5.5, 'Sri Lanka': 5.5, Thailand: 7, Philippines: 8, Indonesia: 7, 'Hong Kong': 8, 'South Korea': 9, China: 8, 'United Kingdom': 0, Ireland: 0, Netherlands: 1, France: 1, Spain: 1, Italy: 1, Poland: 1, Belgium: 1, Denmark: 1, Sweden: 1, Germany: 1, Austria: 1, Norway: 1, Switzerland: 1, Canada: -5, 'United States': -5, Australia: 10, Japan: 9, Malaysia: 8, Singapore: 8, 'Saudi Arabia': 3, 'New Zealand': 12 }
const ROLE = ['purchasing', 'purchase', 'buying', 'buyer', 'sourcing', 'procurement', 'import', 'einkauf', 'achats', 'compras', 'trade', 'sales', 'info', 'contact', 'hello', 'office', 'enquiries', 'inquiries', 'mail', 'service', 'kontakt', 'admin']
const SKIP_DOMAINS = /(amazon|alibaba|ebay|etsy|facebook|linkedin|instagram|google|wikipedia|yelp|indiamart|made-in-china|tradekey|europages|kompass|yellowpages|zoominfo|bloomberg|dnb\.com|crunchbase|globalsources|exporthub|go4worldbusiness)\./i

// ---------- AI ----------
const COMPANY = `You write for BengalExport, an export house in Bangladesh with a network of 10,000+ suppliers: garment, footwear and home-textile factories, jute mills, farms and food processors.
What BengalExport does for buyers, end to end: matches the right supplier to the product, volume and price; checks reliability (capacity, track record); manages compliance (partner factories certified to BSCI/amfori, WRAP, Sedex, OEKO-TEX, GOTS, ISO 9001, HACCP, ISO 22000, GlobalGAP, Halal, matched to the buyer's requirements); its own QC team inspects every order before shipment; handles export documents, certificates of origin, FCL/LCL/air freight and insurance to the buyer's port (CIF/CIP). Payment only by 100% irrevocable LC at sight. Quotations within 24 hours; ready-style samples ship within 24 hours. Most goods enter the EU, UK, Canada, Australia and Japan at 0% import duty (LDC rules).
Voice: a serious, senior export professional writing to a buyer. Short, factual, calm, no hype, no exclamation marks. Never invent prices, customers, awards, years in business, headcount or certificates beyond those listed.`

const lastAi = { stop: '', turns: 0, len: 0 }
async function llm(system: string, prompt: string, opts: { json?: boolean; search?: boolean } = {}): Promise<string> {
  const g = Deno.env.get('GEMINI_API_KEY')
  if (g) {
    const body: Record<string, unknown> = { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, ...(opts.json && !opts.search ? { responseMimeType: 'application/json' } : {}) } }
    if (opts.search) body.tools = [{ google_search: {} }]
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${g}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`)
    const j = await r.json(); return j.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''
  }
  // Accept a pasted key even if extra text came with it, and never echo it back.
  const a = (Deno.env.get('ANTHROPIC_API_KEY') ?? '').match(/sk-ant-[A-Za-z0-9_-]+/)?.[0]
  if (a) {
    const messages: any[] = [{ role: 'user', content: prompt + (opts.json ? '\nReply with JSON only, no other text.' : '') }]
    for (let turn = 0; turn < 3; turn++) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'x-api-key': a, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-5-5', max_tokens: opts.search ? 10000 : 4000, system, messages, ...(opts.search ? { tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }] } : {}) }),
      })
      if (!r.ok) throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 200)}`)
      const j = await r.json()
      lastAi.stop = j.stop_reason ?? ''; lastAi.turns = turn + 1
      if (j.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: j.content }); continue }
      const blocks = (j.content ?? []) as { type: string; text?: string }[]
      const lastTool = blocks.map((c) => c.type).lastIndexOf('web_search_tool_result')
      const text = blocks.slice(lastTool + 1).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('')
      lastAi.len = text.length
      return text
    }
    return ''
  }
  throw new Error('AI is not connected')
}
const clean = (e: unknown) => String(e).replace(/sk-ant-[A-Za-z0-9_-]+/g, '[key]').replace(/x-api-key[^\n"]*/gi, '[header]')
function parseJson<T>(s: string): T {
  const t = s.replace(/```(json)?/g, '').trim()
  const start = t.search(/[[{]/); const end = Math.max(t.lastIndexOf(']'), t.lastIndexOf('}'))
  try { return JSON.parse(t.slice(start, end + 1)) } catch (e) {
    if (t[start] !== '[') throw e
    const objs: unknown[] = []
    for (const m of t.slice(start).matchAll(/\{[^{}]*\}/g)) { try { objs.push(JSON.parse(m[0])) } catch { /* skip */ } }
    if (!objs.length) throw e
    return objs as T
  }
}

// ---------- helpers ----------
async function settings(key: string) { return ((await db.from('bde_settings').select('value').eq('key', key).maybeSingle()).data?.value ?? {}) as Record<string, any> }
async function log(kind: string, summary: unknown) { await db.from('bde_autopilot_log').insert({ kind, summary }) }
async function sign(text: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SERVICE), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text))
  return Array.from(new Uint8Array(sig)).slice(0, 10).map((b) => b.toString(16).padStart(2, '0')).join('')
}
const hostOf = (u: string) => { try { return new URL(u.startsWith('http') ? u : `https://${u}`).hostname.replace(/^www\./, '').toLowerCase() } catch { return '' } }
const baseDomain = (h: string) => { const p = h.split('.'); return (p.length > 2 && p[p.length - 1].length === 2 && /^(co|com|org|net|ac|gov|ltd|plc)$/.test(p[p.length - 2]) ? p.slice(-3) : p.slice(-2)).join('.') }
async function hasMx(domain: string) {
  try { const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`); const j = await r.json(); return (j.Answer ?? []).some((a: { type: number }) => a.type === 15) } catch { return false }
}
async function fetchText(url: string) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; BengalExportBot/1.0; +' + SITE + ')' }, redirect: 'follow', signal: AbortSignal.timeout(8000) })
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('html')) return ''
    return (await r.text()).slice(0, 400_000)
  } catch { return '' }
}
function emailsIn(html: string) {
  const s = html.replace(/&#64;|&#x40;|\[at\]|\(at\)/gi, '@')
  return [...new Set([...s.matchAll(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi)].map((m) => m[0].toLowerCase()))].filter((e) => !/\.(png|jpg|jpeg|gif|webp|svg)$/.test(e) && !/example|sentry|wixpress|domain\.com/.test(e))
}
/** Only public role addresses on the company's own domain, never personal names. */
function pickEmail(emails: string[], host: string) {
  const own = emails.filter((e) => baseDomain(e.split('@')[1]) === baseDomain(host))
  for (const r of ROLE) { const hit = own.find((e) => e.split('@')[0].replace(/[._-]/g, '') === r || e.split('@')[0].startsWith(r)); if (hit) return hit }
  return ''
}
async function findEmail(website: string) {
  const host = hostOf(website); if (!host || SKIP_DOMAINS.test(host)) return { host, email: '', contactUrl: '' }
  let contactUrl = ''
  const root = `https://${host}`
  const home = await fetchText(root)
  let found = emailsIn(home)
  let email = pickEmail(found, host)
  if (!email) {
    const links = [...home.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((h) => /contact|kontakt|contatti|contacto|about|impressum|imprint|over-ons|nous-contacter/i.test(h)).slice(0, 3)
    for (const l of [...links, '/contact', '/contact-us']) {
      let u = l; try { u = new URL(l, root).toString() } catch { continue }
      if (hostOf(u) !== host) continue
      const html = await fetchText(u)
      if (!contactUrl && html && /<form/i.test(html) && /contact|kontakt|contatti|contacto/i.test(u)) contactUrl = u
      found = emailsIn(html); email = pickEmail(found, host)
      if (email) break
    }
  }
  if (email && !(await hasMx(email.split('@')[1]))) email = ''
  return { host, email, contactUrl }
}
const localHour = (country: string) => { const off = UTC_OFFSET[country] ?? 0; const d = new Date(Date.now() + off * 3600e3); return { h: d.getUTCHours(), dow: d.getUTCDay() } }

// ---------- 1. Plan: which market and product today ----------
async function plan(n = 2) {
  const cfg = await settings('autopilot')
  const since = new Date(Date.now() - 45 * 864e5).toISOString()
  const [{ data: views }, { data: leads }, { data: pros }] = await Promise.all([
    db.from('bde_web_events').select('category, tz').eq('kind', 'product_view').gte('created_at', since).limit(20000),
    db.from('bde_leads').select('country, items').gte('created_at', since),
    db.from('bde_contacts').select('country, interests, research, replied_at').contains('tags', ['prospect']).limit(20000),
  ])
  const skip = new Set<string>((cfg.skip_countries ?? []).map(String))
  const { data: recent } = await db.from('bde_autopilot_log').select('summary').eq('kind', 'research').gte('created_at', new Date(Date.now() - 8 * 36e5).toISOString()).limit(40)
  const tried = new Map<string, number>()
  for (const l of recent ?? []) for (const r of ((l as any).summary?.results ?? []) as any[]) { const k = `${r.fam}|${r.country}`; tried.set(k, (tried.get(k) ?? 0) + (r.found ? 0.5 : 1)) }
  const focusC = new Set<string>((cfg.focus_countries ?? []).map(String))
  const focusF = new Set<string>((cfg.focus_families ?? []).map(String))
  const rows: { t: Target; country: string; score: number; why: string[] }[] = []
  for (const t of TARGETS) {
    if (focusF.size && !focusF.has(t.cat) && !focusF.has(t.fam)) continue
    const demand = (views ?? []).filter((v) => v.category === t.fam).length
    for (const country of t.markets) {
      if (skip.has(country) || (focusC.size && !focusC.has(country))) continue
      const why: string[] = []
      let score = 10
      if (DUTY_FREE.has(country)) { score += 8; why.push('0% import duty') }
      const lh = localHour(country)
      if (lh.dow > 0 && lh.dow < 6 && lh.h >= 6 && lh.h < 15) { score += 30; why.push('office hours now') }
      if (demand) { score += Math.min(15, demand); why.push(`${demand} product view${demand > 1 ? 's' : ''} on the site`) }
      const asked = (leads ?? []).filter((l) => l.country === country).length
      if (asked) { score += asked * 6; why.push(`${asked} quote requests from ${country}`) }
      const done = (pros ?? []).filter((p) => p.country === country && (p.research as any)?.fam === t.fam)
      const replies = done.filter((p) => p.replied_at).length
      if (done.length >= 8) { const rate = replies / done.length; score += rate * 60 - done.length * 0.6; if (replies) why.push(`${replies} replies from ${done.length} contacted`) } else if (!done.length) { score += 4; why.push('new market to test') }
      const fails = tried.get(`${t.fam}|${country}`) ?? 0
      if (fails) score -= 25 * fails
      score += Math.random() * 6
      rows.push({ t, country, score, why })
    }
  }
  rows.sort((a, b) => b.score - a.score)
  const picked: typeof rows = []
  for (const r of rows) { if (picked.length >= n) break; if (!picked.some((p) => p.t.cat === r.t.cat || p.country === r.country)) picked.push(r) }
  return picked.map((p) => ({ fam: p.t.fam, label: p.t.label, country: p.country, buyers: p.t.buyers, why: p.why }))
}

// ---------- 2. Research: real companies with a public role email ----------
async function research(target: { fam: string; label: string; country: string; buyers: string }, want: number, save: boolean, stats: Record<string, number> = {}) {
  const { data: known } = await db.from('bde_contacts').select('email, website').limit(50000)
  const knownHosts = new Set((known ?? []).flatMap((k) => [hostOf(k.website ?? ''), String(k.email).split('@')[1]]).filter(Boolean))
  const seg = pickSegment()
  const text = await llm(COMPANY, `Use web search to find ${want + 10} real, currently operating companies in ${target.country} that buy ${target.label}.
Focus on this buyer type: ${seg.brief}. Typical buyers of this product: ${target.buyers}.
Exclude marketplaces, directories, B2B portals and factories in Asia. Also exclude: shops that only resell other brands (for example a shoe shop selling Skechers and Clarks), single-store or family shops, second-hand or vintage traders, print-on-demand and single-piece sellers, and anyone too small to order at least one carton or pallet direct from a factory.
Return a JSON array: [{"company": "...", "website": "https://...", "email": "their public company email (sales@, info@, purchasing@ etc.) if you saw it in the search results or on their site, else empty", "type": "importer|wholesaler|brand|retail chain|online seller|distributor|promotional supplier", "why": "one short sentence on what they sell and why ${target.label} fits", "bd_evidence": "how we know they already buy from Bangladesh, or empty", "import_score": 1-5 (5 = clearly imports direct from Asian factories or runs its own label in volume, 3 = unclear, 1 = small reseller)}]. Only include companies whose website you actually found. Prefer companies that show a public contact email. Keep \"why\" and \"bd_evidence\" under 15 words each. Your final message must be only the JSON array, with no commentary before or after it. If you find fewer companies, return the ones you have.`, { json: true, search: true })
  let list: { company: string; website: string; email?: string; type: string; why: string; bd_evidence?: string; import_score?: number }[] = []
  try { list = parseJson(text) } catch { list = []; stats.parse_failed = 1 }
  if (!Array.isArray(list)) list = []
  const before = list.length
  list = list.filter((c) => !!c.bd_evidence || Number(c.import_score ?? 0) >= (/online|retail|shop|store/i.test(c.type ?? '') ? 4 : 3))
  stats.low_fit_dropped = before - list.length
  const out: Record<string, unknown>[] = []
  stats.candidates = list.length; stats.ai_text = text.length; stats.ai_turns = lastAi.turns; (stats as any).ai_stop = lastAi.stop
  let noEmail = 0
  // Check candidate websites in parallel: much faster than one by one.
  const cands = list.map((c) => ({ c, h: hostOf(c.website ?? '') })).filter((x, i, arr) => x.h && !knownHosts.has(x.h) && !SKIP_DOMAINS.test(x.h) && arr.findIndex((y) => y.h === x.h) === i).slice(0, want + 8)
  const checked = await Promise.all(cands.map(async (x) => {
    const f = await findEmail(x.h)
    if (!f.email && x.c.email) { const e = pickEmail([String(x.c.email).toLowerCase().trim()], x.h); if (e && (await hasMx(e.split('@')[1]))) f.email = e }
    return { ...x, ...f }
  }))
  stats.new_sites = cands.length; stats.with_email = checked.filter((x) => x.email).length
  for (const { c, h: host, email, contactUrl } of checked) {
    if (out.length >= want) break
    knownHosts.add(host)
    if (!email) {
      if (save && noEmail++ < 4) await addTask(contactUrl ? 'contact_form' : 'linkedin', { company: c.company, country: target.country, label: target.label, why: c.why, url: contactUrl || linkedinSearch(c.company), website: `https://${host}` })
      continue
    }
    const row = { email, company: String(c.company).slice(0, 120), country: target.country, website: `https://${host}`, interests: [TARGETS.find((t) => t.fam === target.fam)?.cat ?? ''], tags: ['prospect', 'autopilot'], source: 'autopilot', status: 'subscribed', seq_step: 0, next_touch_at: new Date().toISOString(), research: { fam: target.fam, label: target.label, segment: seg.id, type: c.type, why: c.why, bd: c.bd_evidence || '', fit: Number(c.import_score ?? 0), found_at: new Date().toISOString() }, score: (c.bd_evidence ? 15 : 5) + Number(c.import_score ?? 0) }
    if (save) { const { error } = await db.from('bde_contacts').insert(row); if (error) continue }
    out.push(row)
  }
  return out
}

// ---------- 3. Write and send ----------
function fallbackEmail(c: any, step: number, link = SITE) {
  const r = c.research ?? {}; const label = r.label ?? 'products'
  const duty = DUTY_FREE.has(c.country) ? ` They enter ${c.country} at 0% import duty.` : ''
  if (step === 0) return { subject: `${label[0].toUpperCase() + label.slice(1)} from Bangladesh`, body: `Hello,\n\nI saw that ${c.company} works with ${label}, so I wanted to introduce BengalExport. We are an export house in Bangladesh with a network of 10,000+ suppliers, including certified factories for ${label}. Our own QC team inspects every order, and we quote delivered to your port.${duty}\n\nTerms are LC at sight. Ready-style samples can ship within 24 hours.\n\nYou can see our ${label} range and request a quotation in one minute here:\n${link}\n\nOr simply reply with your specification and destination port.` }
  if (step === 1) return { subject: `Re: ${label} from Bangladesh`, body: `Hello again,\n\nA short follow-up. If it helps to judge quality first, we can ship ready-style samples of ${label} within 24 hours, and the sample cost is credited on your first order.\n\nYou can request a quotation for your usual specification here:\n${link}` }
  return { subject: `Close the file?`, body: `Hello,\n\nI do not want to fill your inbox, so this is my last note. If ${label} from Bangladesh become interesting later, just reply to this email and I will send prices delivered to your port.\n\nThank you for your time.` }
}
async function writeEmail(c: any, step: number, link = SITE) {
  if (!aiReady()) return fallbackEmail(c, step, link)
  const r = c.research ?? {}
  const kind = ['first email', 'second email, sent 4 days after the first, with a new angle: samples in 24 hours and the inspection before shipping', 'third and last email, sent 6 days after the second: short, polite, gives them an easy way to say yes later'][step]
  try {
    const out = parseJson<{ subject: string; body: string }>(await llm(COMPANY, `Write the ${kind} of a cold B2B outreach from BengalExport to ${c.company} in ${c.country}.
What we know about them: ${r.type ?? 'company'}; ${r.why ?? ''}. Product to offer: ${r.label}.
${DUTY_FREE.has(c.country) ? `Goods from Bangladesh enter ${c.country} at 0% import duty: mention it once.` : 'Do not mention import duty.'}
Rules: plain text, 60-100 words, written by a senior export manager (not a salesperson), no greeting by personal name (we only have a company address, start with "Hello,"), first line specific to their business, mention the 10,000+ supplier network or the most relevant certifications for this product once, the call to action is to see the range and request a quotation on our website: put the placeholder {{LINK}} alone on its own line after one short sentence inviting them to do so (for example "You can see our range and request a quotation in one minute here:"), and add that they can also simply reply; no other links, no attachments, no exclamation marks, no spam words (free, guarantee, best price, cheap, urgent), no signature (it is added). Subject: 2-6 words, specific, lower-key${step ? ', may start with "Re: "' : ''}.
Return JSON {"subject": "...", "body": "..."}.`, { json: true }))
    if (out.subject && out.body && out.body.length < 1500) return { subject: out.subject, body: out.body.includes('{{LINK}}') ? out.body.replace('{{LINK}}', link) : `${out.body}\n\nRequest a quotation here:\n${link}` }
  } catch { /* fall through */ }
  return fallbackEmail(c, step, link)
}
let transport: ReturnType<typeof nodemailer.createTransport> | null = null
function mailer() {
  transport ??= nodemailer.createTransport({ host: SMTP.host, port: SMTP.port, secure: SMTP.port === 465, auth: { user: SMTP.user, pass: SMTP.pass } })
  return transport
}
const linkFor = (c: any) => `${SITE}products/${c.research?.fam ? c.research.fam + '/' : ''}?utm_source=outreach&utm_medium=email&utm_campaign=c${c.id}`
async function writeBatch(list: { c: any; step: number }[]) {
  const out = new Map<number, { subject: string; body: string }>()
  if (!aiReady() || !list.length) return out
  const kinds = ['first email', 'second email, 4 days after the first, new angle: samples in 24 hours and inspection before shipping', 'third and last email, 6 days after the second: short, polite, easy way to say yes later']
  const items = list.map(({ c, step }) => ({ id: c.id, company: c.company, country: c.country, about: `${c.research?.type ?? 'company'}; ${c.research?.why ?? ''}`, product: c.research?.label, email: kinds[step] ?? kinds[0], duty_free: DUTY_FREE.has(c.country) }))
  try {
    const arr = parseJson<{ id: number; subject: string; body: string }[]>(await llm(COMPANY, `Write one cold B2B outreach email from BengalExport for each company below.\n${JSON.stringify(items)}\nRules for every email: plain text, 60-100 words, written by a senior export manager (not a salesperson), start with "Hello," (no personal name), first line specific to their business, mention the 10,000+ supplier network or the most relevant certifications once, if duty_free is true mention once that goods from Bangladesh enter their country at 0% import duty (otherwise do not mention duty), the call to action is our product page for their product: in one short sentence say what they will find there (the range with specifications, minimum orders, indicative prices and lead times, and a one-minute quote form that returns a price delivered to their port within 24 hours), then put the placeholder {{LINK}} alone on its own line; then one line saying they can also simply reply with their specification. Sound like a real person who looked at their business, not a template: no buzzwords (leverage, synergy, solutions, cutting-edge, seamless), no flattery, no claims you cannot back. No other links, no exclamation marks, no spam words (free, guarantee, best price, cheap, urgent, act now), no signature. Follow-ups may use a subject starting "Re: ". Subject: 2-6 words naming their product, lower-key, no capitals except the first word and names. Each email must be different.\nReturn a JSON array [{"id": <id>, "subject": "...", "body": "..."}] with one entry per company.`, { json: true }))
    for (const e of Array.isArray(arr) ? arr : []) {
      const it = list.find((x) => x.c.id === Number(e.id))
      if (!it || !e.subject || !e.body || e.body.length > 1500) continue
      const link = linkFor(it.c)
      out.set(it.c.id, { subject: e.subject, body: e.body.includes('{{LINK}}') ? e.body.replace('{{LINK}}', link) : `${e.body}\n\nRequest a quotation here:\n${link}` })
    }
  } catch { /* fallback per email */ }
  return out
}
async function sendOne(c: any, step: number, cfg: Record<string, any>, address: string, pre?: { subject: string; body: string }) {
  const link = linkFor(c)
  const { subject, body } = pre ?? fallbackEmail(c, step, link)
  const unsub = `${FN}/u?c=${c.id}&h=${await sign(`u|${c.id}`)}`
  // Tracking: a click goes through our redirect (counted, then on to the page); an invisible pixel counts opens.
  const th = await sign(`t|${c.id}|${step}`)
  const tracked = `${FN}/r?c=${c.id}&s=${step}&h=${th}&u=${encodeURIComponent(link)}`
  const pixel = `${FN}/o?c=${c.id}&s=${step}&h=${th}`
  const signature = `\n\n${cfg.sender_name || 'BengalExport sales team'}\nBengalExport, Bangladesh\nWhatsApp +880 1805-070650\nbengalexport.online\n\n${address ? address + '\n' : ''}If this is not relevant, reply "no" or unsubscribe here: ${unsub}`
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const htmlBody = esc(body + signature).split(esc(link)).join(`<a href="${tracked}" style="color:#0f6b5c">${esc(link.split('?')[0])}</a>`).replace(esc(unsub), `<a href="${unsub}" style="color:#888">unsubscribe</a>`).replace(/\n/g, '<br>')
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#1f2937;max-width:600px">${htmlBody}</div><img src="${pixel}" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">`
  const info = await mailer().sendMail({ from: { name: cfg.sender_name || 'BengalExport', address: SMTP.user }, to: c.email, subject, text: body + signature, html, headers: { 'List-Unsubscribe': `<${unsub}>, <mailto:${SMTP.user}?subject=unsubscribe>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } })
  const now = new Date()
  const gap = step === 0 ? 4 : 6
  await db.from('bde_outreach').insert({ contact_id: c.id, step, subject, body, status: 'sent', message_id: info.messageId })
  await db.from('bde_contacts').update({ seq_step: step + 1, last_touch_at: now.toISOString(), next_touch_at: step + 1 >= 3 ? null : new Date(now.getTime() + gap * 864e5).toISOString() }).eq('id', c.id)
}
function todaysCap(cfg: Record<string, any>) {
  if (cfg.warmup === false) return Number(cfg.daily_cap ?? 150)
  const start = cfg.warmup_start ? new Date(cfg.warmup_start).getTime() : Date.now()
  const days = Math.max(0, Math.floor((Date.now() - start) / 864e5))
  return Math.min(Number(cfg.daily_cap ?? 45), 10 + days * 4)
}
async function sendBatch(force = false, maxRun = 0) {
  const cfg = await settings('autopilot'); const email = await settings('email')
  if (!cfg.enabled && !force) return { skipped: 'autopilot is off' }
  if (!mailboxReady()) return { skipped: 'outreach mailbox not connected' }
  if (!cfg.warmup_start) { cfg.warmup_start = new Date().toISOString(); await db.from('bde_settings').update({ value: cfg }).eq('key', 'autopilot') }
  const since = new Date(); since.setUTCHours(0, 0, 0, 0)
  const { count: sentToday } = await db.from('bde_outreach').select('id', { count: 'exact', head: true }).gte('created_at', since.toISOString())
  const cap = todaysCap(cfg); const room = cap - (sentToday ?? 0)
  if (room <= 0) return { sent: 0, reason: `daily limit ${cap} reached` }
  // Pace to the daily target: spread what is left over the runs left today (UTC day = 06:00-06:00 Dhaka).
  const runsLeft = Math.max(1, Math.ceil((since.getTime() + 864e5 - Date.now()) / 18e5))
  const base = Number(cfg.per_hour ?? 10)
  const perRun = Math.min(15, Math.max(Math.ceil(base / 2), Math.ceil(room / runsLeft)))
  const perHour = Math.max(base, perRun * 2)
  const { count: lastHour } = await db.from('bde_outreach').select('id', { count: 'exact', head: true }).eq('status', 'sent').gte('created_at', new Date(Date.now() - 50 * 6e4).toISOString())
  const hourRoom = perHour - (lastHour ?? 0)
  if (!force && hourRoom <= 0) return { sent: 0, reason: `hourly limit ${perHour} reached` }
  const batch = force ? Math.min(room, 10) : Math.max(1, Math.min(room, hourRoom, maxRun || perRun))
  const { data: due } = await db.from('bde_contacts').select('*').contains('tags', ['prospect']).eq('status', 'subscribed').is('replied_at', null).lt('seq_step', 3).lte('next_touch_at', new Date().toISOString()).order('seq_step', { ascending: false }).order('score', { ascending: false }).limit(200)
  let sent = 0; const errors: string[] = []
  // Buyers in office hours go first; if there are not enough, send anyway so the hourly target is met (the email waits in their inbox).
  const inHours = (c: any) => { const { h, dow } = localHour(c.country ?? ''); return dow > 0 && dow < 6 && h >= 8 && h < 17 }
  const ordered = [...(due ?? [])].sort((a, b) => Number(inHours(b)) - Number(inHours(a)))
  const pick = ordered.slice(0, batch)
  const written = await writeBatch(pick.map((c) => ({ c, step: c.seq_step ?? 0 })))
  for (const c of pick) {
    try { await sendOne(c, c.seq_step ?? 0, cfg, email.physical_address ?? '', written.get(c.id)); sent++ } catch (e) {
      errors.push(clean(e).slice(0, 160))
      await db.from('bde_outreach').insert({ contact_id: c.id, step: c.seq_step ?? 0, subject: '-', body: '-', status: 'failed', error: clean(e).slice(0, 300) })
      if (/auth|login|credential/i.test(String(e))) break
    }
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000))
  }
  if (!force && sent < batch) await alertOwner(cfg, `Send run sent ${sent} of ${batch}`, `The autopilot sent ${sent} of ${batch} emails this run (${sentToday ?? 0} of ${cap} today).\n${pick.length < batch ? `Only ${pick.length} buyers were waiting: the finder is behind.` : ''}${errors.length ? `\nErrors: ${errors.join(' | ')}` : ''}\n\nPanel: ${SITE}admin#autopilot`)
  return { sent, batch, cap, sent_today: (sentToday ?? 0) + sent, runs_left: runsLeft, errors, ai_written: written.size }
}
async function alertOwner(cfg: Record<string, any>, subject: string, text: string) {
  const to = cfg.report_email || (await settings('alerts')).new_lead_email
  if (!to || !mailboxReady()) return
  const { count } = await db.from('bde_autopilot_log').select('id', { count: 'exact', head: true }).eq('kind', 'alert').gte('created_at', new Date(Date.now() - 3 * 36e5).toISOString())
  if (count) return
  await log('alert', { subject, text })
  try { await mailer().sendMail({ from: { name: 'BengalExport autopilot', address: SMTP.user }, to, subject: `Autopilot alert: ${subject}`, text }) } catch { /* logged */ }
}

// ---------- 4. Morning: replies, clicks, report ----------
async function readReplies() {
  if (!mailboxReady()) return { skipped: 'outreach mailbox not connected', items: [] as any[] }
  const { ImapFlow } = await import('npm:imapflow@1.0.164')
  const { simpleParser } = await import('npm:mailparser@3.7.1')
  const client = new ImapFlow({ host: SMTP.imapHost, port: SMTP.imapPort, secure: true, auth: { user: SMTP.user, pass: SMTP.pass }, logger: false })
  await client.connect()
  const items: any[] = []
  const lock = await client.getMailboxLock('INBOX')
  try {
    const since = new Date(Date.now() - 2 * 864e5)
    for await (const msg of client.fetch({ since, seen: false }, { source: true, uid: true })) {
      const m = await simpleParser(msg.source)
      const from = (m.from?.value?.[0]?.address ?? '').toLowerCase()
      const text = String(m.text ?? '').split(/\n>|\nOn .+wrote:|\n-----Original/)[0].slice(0, 2500)
      items.push({ uid: msg.uid, from, subject: m.subject ?? '', text, full: String(m.text ?? '').slice(0, 20000), messageId: m.messageId ?? null, inReplyTo: m.inReplyTo ?? null, bounce: /mailer-daemon|postmaster/i.test(from) })
    }
    if (items.length) await client.messageFlagsAdd(items.map((i) => i.uid), ['\\Seen'], { uid: true })
  } finally { lock.release(); await client.logout() }
  const out: any[] = []
  for (const it of items) {
    if (it.bounce) {
      const bad = emailsIn(it.text).find((e) => e !== SMTP.user)
      if (bad) { await db.from('bde_contacts').update({ status: 'bounced', next_touch_at: null }).eq('email', bad); out.push({ email: bad, label: 'bounced' }) }
      continue
    }
    let { data: c } = await db.from('bde_contacts').select('*').eq('email', it.from).maybeSingle()
    if (!c) c = (await db.from('bde_contacts').select('*').contains('tags', ['prospect']).ilike('email', `%@${it.from.split('@')[1]}`).limit(1).maybeSingle()).data
    const { data: row } = await db.from('bde_inbox').insert({ direction: 'in', from_email: it.from, to_email: SMTP.user, subject: it.subject, body: it.full || it.text, message_id: it.messageId, in_reply_to: it.inReplyTo, contact_id: c?.id ?? null }).select('id').maybeSingle()
    if (!c) continue
    let a = { label: /^\s*(no|stop|unsubscribe|remove)\b/i.test(it.text) ? 'not_interested' : 'question', summary: it.text.slice(0, 160), next_step: 'Read the reply and answer', care_note: '' }
    if (aiReady()) try { a = parseJson(await llm(COMPANY, `Classify this reply to our outreach email. Company: ${c.company}, ${c.country}. Product offered: ${c.research?.label}.
Reply subject: ${it.subject}
Reply: ${it.text}
Return JSON {"label": "interested|question|not_now|not_interested|unsubscribe|auto_reply|wrong_person", "summary": "one sentence", "next_step": "one concrete action for the team", "care_note": "max 60 words hand-over note for the customer care team: who they are, what they want, what to send"}`, { json: true })) } catch { /* keep rule-based */ }
    const stop = a.label !== 'auto_reply'
    await db.from('bde_contacts').update({ replied_at: stop ? new Date().toISOString() : c.replied_at, next_touch_at: stop ? null : c.next_touch_at, status: a.label === 'unsubscribe' || a.label === 'not_interested' ? 'unsubscribed' : c.status, score: (c.score ?? 0) + (a.label === 'interested' ? 40 : a.label === 'question' ? 25 : 0), tags: [...new Set([...(c.tags ?? []), `reply:${a.label}`])] }).eq('id', c.id)
    await db.from('bde_activity').insert({ entity: 'contact', entity_id: c.id, actor: 'autopilot', kind: 'reply', body: `Email reply (${a.label}): ${a.summary}` })
    if (a.label === 'interested' || a.label === 'question') {
      await db.from('bde_leads').insert({ kind: 'email_reply', reference: `BDE-R${Date.now().toString(36).toUpperCase()}`, items: [{ style: c.research?.label ?? 'Products' }], requirement: it.text.slice(0, 2000), quantity: '-', country: c.country ?? '-', company: c.company ?? '-', name: c.name ?? c.company ?? '-', email: c.email, website: c.website, consent: false, contact_id: c.id, internal_notes: `Autopilot: ${a.summary}\nNext step: ${a.next_step}\nCare team: ${a.care_note}` })
    }
    if (row?.id) await db.from('bde_inbox').update({ label: a.label, summary: a.summary, next_step: a.next_step, care_note: a.care_note }).eq('id', row.id)
    out.push({ company: c.company, country: c.country, email: c.email, ...a })
  }
  return { items: out }
}
/** Admin answers a buyer from the panel: sent from the sales mailbox, threaded, logged in the inbox. */
async function sendReply(body: { inbox_id?: number; to?: string; subject?: string; text?: string }, by: string) {
  const text = String(body.text ?? '').trim()
  if (!text) throw new Error('Write a message first')
  let to = String(body.to ?? '').trim(); let subject = String(body.subject ?? '').trim(); let inReplyTo: string | null = null; let contactId: number | null = null
  if (body.inbox_id) {
    const { data: m } = await db.from('bde_inbox').select('*').eq('id', body.inbox_id).maybeSingle()
    if (!m) throw new Error('Message not found')
    to = m.from_email; subject = m.subject?.toLowerCase().startsWith('re:') ? m.subject : `Re: ${m.subject ?? ''}`; inReplyTo = m.message_id; contactId = m.contact_id
  }
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(to)) throw new Error('No valid recipient')
  const cfg = await settings('autopilot')
  const signature = `\n\n${cfg.sender_name || 'BengalExport sales team'}\nBengalExport, Bangladesh\nWhatsApp +880 1805-070650\nbengalexport.online`
  const info = await mailer().sendMail({ from: { name: cfg.sender_name || 'BengalExport', address: SMTP.user }, to, subject: subject || 'BengalExport', text: text + signature, ...(inReplyTo ? { inReplyTo, references: [inReplyTo] } : {}) })
  await db.from('bde_inbox').insert({ direction: 'out', from_email: SMTP.user, to_email: to, subject, body: text, message_id: info.messageId, in_reply_to: inReplyTo, contact_id: contactId, sent_by: by, handled: true })
  if (body.inbox_id) await db.from('bde_inbox').update({ handled: true }).eq('id', body.inbox_id)
  return { ok: true }
}
/** Every 15 minutes: read new replies and alert the owner at once about interested buyers. */
async function repliesNow(force = false) {
  const cfg = await settings('autopilot'); const alerts = await settings('alerts')
  if (!cfg.enabled && !force) return { skipped: 'autopilot is off' }
  const r = await readReplies()
  const items = (r.items ?? []) as any[]
  if (items.length) await log('replies', { items })
  const hot = items.filter((x) => x.label === 'interested' || x.label === 'question')
  const to = cfg.report_email || alerts.new_lead_email
  if (hot.length && to && mailboxReady()) {
    const text = hot.map((x) => `${x.company} (${x.country}) replied: ${x.label.toUpperCase()}\n${x.summary}\nWhat to do: ${x.next_step}\nCare team: ${x.care_note}\nTheir email: ${x.email}\n`).join('\n') + `\nReply from sales@ (webmail: https://privateemail.com) or open the admin panel: ${SITE}admin#leads`
    try { await mailer().sendMail({ from: { name: 'BengalExport autopilot', address: SMTP.user }, to, subject: `Buyer reply: ${hot.map((x) => x.company).join(', ')}`, text }) } catch { /* panel still has it */ }
  }
  return { checked: items.length, hot: hot.length }
}
async function matchClicks() {
  const since = new Date(Date.now() - 864e5).toISOString()
  const { data } = await db.from('bde_web_events').select('visitor_id, utm_campaign, kind, product, path').eq('utm_source', 'outreach').gte('created_at', since).limit(5000)
  const by: Record<string, { pages: Set<string>; quote: boolean }> = {}
  for (const e of data ?? []) { const id = String(e.utm_campaign ?? '').replace(/^c/, ''); if (!/^\d+$/.test(id)) continue; by[id] ??= { pages: new Set(), quote: false }; by[id].pages.add(e.product || e.path); if (e.kind === 'quote_submitted') by[id].quote = true }
  const out: any[] = []
  for (const [id, v] of Object.entries(by)) {
    const { data: c } = await db.from('bde_contacts').select('id, company, country, score, tags, last_click_at').eq('id', Number(id)).maybeSingle()
    if (!c) continue
    if (!c.last_click_at || c.last_click_at < since) await db.from('bde_contacts').update({ last_click_at: new Date().toISOString(), score: (c.score ?? 0) + 10, tags: [...new Set([...(c.tags ?? []), 'hot'])] }).eq('id', c.id)
    out.push({ company: c.company, country: c.country, pages: [...v.pages].slice(0, 5), quote: v.quote })
  }
  return out
}
async function morning(force = false) {
  const cfg = await settings('autopilot'); const alerts = await settings('alerts')
  if (!cfg.enabled && !force) return { skipped: 'autopilot is off' }
  let replies: any = { items: [] }; let replyError = ''
  try { replies = await readReplies() } catch (e) { replyError = clean(e).slice(0, 200) }
  const clicks = await matchClicks()
  const since = new Date(Date.now() - 864e5).toISOString()
  const { data: rlogs } = await db.from('bde_autopilot_log').select('summary').eq('kind', 'replies').gte('created_at', since)
  replies = { ...replies, items: [...(rlogs ?? []).flatMap((l: any) => l.summary?.items ?? []), ...(replies.items ?? [])] }
  const [{ count: sent }, { count: found }, { count: total }, { count: inSeq }] = await Promise.all([
    db.from('bde_outreach').select('id', { count: 'exact', head: true }).eq('status', 'sent').gte('created_at', since),
    db.from('bde_contacts').select('id', { count: 'exact', head: true }).contains('tags', ['autopilot']).gte('created_at', since),
    db.from('bde_contacts').select('id', { count: 'exact', head: true }).contains('tags', ['autopilot']),
    db.from('bde_contacts').select('id', { count: 'exact', head: true }).contains('tags', ['prospect']).is('replied_at', null).lt('seq_step', 3).eq('status', 'subscribed'),
  ])
  const { data: openTasks } = await db.from('bde_tasks').select('kind, title, country').eq('status', 'open').order('created_at', { ascending: false }).limit(50)
  const today = await plan()
  const report = { tasks: { open: (openTasks ?? []).length, rfq: (openTasks ?? []).filter((t) => t.kind === 'rfq').length, top: (openTasks ?? []).slice(0, 5) }, sent: sent ?? 0, found: found ?? 0, total_prospects: total ?? 0, in_sequence: inSeq ?? 0, replies: replies.items ?? [], clicks, plan: today, cap_today: todaysCap(cfg), reply_error: replyError || replies.skipped || '' }
  await log('daily_report', report)
  const to = cfg.report_email || alerts.new_lead_email
  if (to && mailboxReady()) {
    const hot = (report.replies as any[]).filter((r) => r.label === 'interested' || r.label === 'question')
    const lines = [
      `Good morning. Here is what the BengalExport autopilot did in the last 24 hours.`, '',
      `Emails sent: ${report.sent} · New buyers found: ${report.found} · Buyers in follow-up: ${report.in_sequence}`, '',
      hot.length ? `REPLIES TO HANDLE (${hot.length}):` : 'No buyer replies that need action today.',
      ...hot.map((r) => `- ${r.company} (${r.country}), ${r.label}: ${r.summary}\n  Care team: ${r.care_note || r.next_step}\n  Email: ${r.email}`), '',
      clicks.length ? `BUYERS WHO OPENED THE WEBSITE FROM OUR EMAIL (${clicks.length}):` : '',
      ...clicks.map((c) => `- ${c.company} (${c.country}) looked at ${c.pages.join(', ')}${c.quote ? ' and SENT A QUOTE REQUEST' : ''}`), '',
      report.tasks.open ? `TASKS FOR THE CARE TEAM (${report.tasks.open} open, ${report.tasks.rfq} buying requests with ready replies):` : '',
      ...report.tasks.top.map((t: any) => `- ${t.title}${t.country ? ` (${t.country})` : ''}`), '',
      `Today's focus: ${today.map((t) => `${t.label} in ${t.country} (${t.why.join(', ')})`).join('; ')}.`,
      `Today's sending limit: ${report.cap_today} emails, in each buyer's business hours.`, '',
      `Open the panel: ${SITE}admin#autopilot`,
    ].filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    try { await mailer().sendMail({ from: { name: 'BengalExport autopilot', address: SMTP.user }, to, subject: `${hot.length ? `${hot.length} buyer repl${hot.length > 1 ? 'ies' : 'y'} · ` : ''}Autopilot report: ${report.sent} sent, ${clicks.length} visits`, text: lines.join('\n') }) } catch { /* report still in panel */ }
  }
  return report
}
// ---------- 5. Other channels: care-team tasks and buying requests ----------
const linkedinSearch = (company: string) => `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} purchasing OR sourcing OR buyer`)}`
async function addTask(kind: 'rfq' | 'linkedin' | 'contact_form', t: { company: string; country: string; label: string; why?: string; url: string; website?: string; contact_id?: number; title?: string; message?: string; details?: Record<string, unknown> }) {
  let message = t.message ?? ''
  if (!message) {
    const limit = kind === 'linkedin' ? 280 : 700
    const what = kind === 'linkedin' ? 'a LinkedIn connection note (max 280 characters) to the purchasing or sourcing person' : 'a short message for their website contact form'
    message = kind === 'linkedin'
      ? `Hello, I work with BengalExport in Bangladesh. We supply ${t.label} from checked factories, delivered to your port with LC payment. Happy to connect and share prices if useful.`
      : `Hello,\n\nBengalExport supplies ${t.label} from checked Bangladeshi factories. We inspect every order before shipping and quote one price delivered to your port${DUTY_FREE.has(t.country) ? `, and the goods enter ${t.country} at 0% import duty` : ''}. Payment is by LC at sight and samples ship within 24 hours.\n\nWould you like prices delivered to your port? You can reach us on WhatsApp +880 1805-070650 or ${SITE}`
    if (aiReady()) try {
      const out = await llm(COMPANY, `Write ${what} from BengalExport to ${t.company} in ${t.country}. About them: ${t.why ?? ''}. Offer: ${t.label}. Plain text, specific to them, one easy question, no exclamation marks, no invented facts.${kind === 'linkedin' ? ' Hard limit 280 characters.' : ' 60-100 words, end with WhatsApp +880 1805-070650 and the website ' + SITE}. Return only the message.`)
      if (out.trim() && out.length <= limit + 40) message = out.trim().slice(0, limit)
    } catch { /* keep template */ }
  }
  const title = t.title ?? (kind === 'linkedin' ? `Connect on LinkedIn: ${t.company}` : kind === 'contact_form' ? `Send the contact form: ${t.company}` : t.company)
  await db.from('bde_tasks').upsert({ kind, title, company: t.company, country: t.country, url: t.url, message, contact_id: t.contact_id ?? null, details: { label: t.label, why: t.why, website: t.website, ...(t.details ?? {}) }, dedupe_key: `${kind}:${(t.website ? hostOf(t.website) : t.url).toLowerCase()}` }, { onConflict: 'dedupe_key', ignoreDuplicates: true })
}
/** LinkedIn tasks for the best prospects who got our email but have not answered. */
async function linkedinFollowUps(n = 5) {
  const { data } = await db.from('bde_contacts').select('id, company, country, website, research, score').contains('tags', ['prospect']).is('replied_at', null).gte('seq_step', 1).eq('status', 'subscribed').order('score', { ascending: false }).limit(60)
  let made = 0
  for (const c of data ?? []) {
    if (made >= n) break
    const { count } = await db.from('bde_tasks').select('id', { count: 'exact', head: true }).eq('dedupe_key', `linkedin:${hostOf(c.website ?? '')}`)
    if (count) continue
    await addTask('linkedin', { company: c.company, country: c.country, label: c.research?.label ?? 'products', why: c.research?.why, url: linkedinSearch(c.company), website: c.website, contact_id: c.id })
    made++
  }
  return made
}
/** Public buying requests ("we need 10,000 T-shirts") that match what we sell, each with a draft reply. */
async function scanBuyingRequests() {
  if (!aiReady()) return { skipped: 'AI is not connected', found: 0 }
  const cfg = await settings('autopilot')
  const focus = new Set<string>((cfg.focus_families ?? []).map(String))
  const labels = [...new Set(TARGETS.filter((t) => !focus.size || focus.has(t.cat) || focus.has(t.fam)).map((t) => t.label))]
  const pick = labels.sort(() => Math.random() - 0.5).slice(0, 4)
  const text = await llm(COMPANY, `Use web search to find buying requests posted in the last 30 days by real importers, wholesalers or brands who want to BUY any of: ${pick.join('; ')}.
Look at public buying-lead and RFQ boards (for example go4WorldBusiness buying leads, TradeKey buy offers, EC21 buy offers, ExportersIndia and TradeIndia buy leads, Fibre2Fashion, Global Sources RFQs) and trade forums.
Skip offers to SELL, skip requests older than 30 days, skip anything that looks like spam or asks for payment up front. Prefer requests from the UK, EU, USA, Canada, Australia, Japan, Singapore and Saudi Arabia.
Return a JSON array of up to 8: [{"title": "short summary", "buyer": "company or name if shown", "country": "...", "product": "...", "quantity": "...", "url": "link to the request", "posted": "date if shown"}].`, { json: true, search: true })
  let list: { title: string; buyer?: string; country?: string; product: string; quantity?: string; url: string; posted?: string }[] = []
  try { list = parseJson(text) } catch { list = [] }
  let saved = 0
  for (const r of list) {
    if (!r.url || !/^https?:\/\//.test(r.url)) continue
    const { count } = await db.from('bde_tasks').select('id', { count: 'exact', head: true }).eq('dedupe_key', `rfq:${r.url.toLowerCase()}`)
    if (count) continue
    let reply = ''
    try { reply = (await llm(COMPANY, `Write a reply to this buying request from BengalExport. Request: ${JSON.stringify(r)}. 70-120 words, plain text, specific to their product and quantity, ask the 2 details we need for a firm price (specification and destination port), mention delivery to their port, LC at sight and samples in 24 hours, end with WhatsApp +880 1805-070650 and ${SITE}. No invented prices or facts.`)).trim() } catch { /* empty */ }
    await db.from('bde_tasks').upsert({ kind: 'rfq', title: r.title?.slice(0, 160) || r.product, company: r.buyer ?? null, country: r.country ?? null, url: r.url, message: reply, details: r, dedupe_key: `rfq:${r.url.toLowerCase()}` }, { onConflict: 'dedupe_key', ignoreDuplicates: true })
    saved++
  }
  await log('rfq', { searched: pick, found: list.length, saved })
  return { searched: pick, found: list.length, saved }
}
async function channelsDaily(force = false) {
  const cfg = await settings('autopilot')
  if (!cfg.enabled && !force) return { skipped: 'autopilot is off' }
  let rfq: unknown = null; let li = 0
  try { rfq = await scanBuyingRequests() } catch (e) { rfq = { error: clean(e).slice(0, 200) } }
  try { li = await linkedinFollowUps(5) } catch { /* next day */ }
  return { rfq, linkedin: li }
}

async function researchDaily(force = false) {
  const cfg = await settings('autopilot')
  if (!cfg.enabled && !force) return { skipped: 'autopilot is off' }
  if (!aiReady()) return { skipped: 'AI is not connected' }
  const [{ count: waiting }, { count: today }] = await Promise.all([
    db.from('bde_contacts').select('id', { count: 'exact', head: true }).contains('tags', ['prospect']).eq('seq_step', 0).eq('status', 'subscribed').is('replied_at', null),
    db.from('bde_contacts').select('id', { count: 'exact', head: true }).contains('tags', ['autopilot']).gte('created_at', new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()),
  ])
  const stock = Number(cfg.stock_target ?? 150)
  const need = Math.min(stock - (waiting ?? 0), Number(cfg.daily_new ?? 300) - (today ?? 0))
  if (need <= 0 && !force) return { skipped: `${waiting} buyers waiting (target ${stock}), ${today} found today` }
  const started = Date.now()
  const targets = await plan(3)
  const results: any[] = []
  let want = force ? 5 : Math.min(need, 10)
  for (const t of targets) {
    if (want <= 0 || (results.length && Date.now() - started > 55_000)) break
    const stats: Record<string, number> = {}
    try { const got = await research(t, Math.max(1, want), true, stats); want -= got.length; results.push({ ...t, ...stats, segment: (got[0] as any)?.research?.segment, found: got.length, companies: got.map((g: any) => g.company) }) } catch (e) { results.push({ ...t, ...stats, error: clean(e).slice(0, 200) }) }
  }
  await log('research', { results })
  return { results }
}

// ---------- server ----------
async function isAdmin(req: Request) {
  const auth = req.headers.get('authorization') ?? ''
  if (!auth) return false
  const u = createClient(URL_, ANON, { global: { headers: { authorization: auth } }, auth: { persistSession: false } })
  const { data } = await u.rpc('bde_is_admin'); return !!data
}
let cronTok: string | null = null
async function isCron(req: Request) {
  cronTok ??= (await db.from('bde_secrets').select('value').eq('key', 'cron_token').maybeSingle()).data?.value ?? null
  return !!cronTok && cronTok.length >= 20 && req.headers.get('x-bde-cron') === cronTok
}
const page = (t: string, b: string) => new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t}</title><body style="font-family:system-ui,sans-serif;max-width:520px;margin:12vh auto;padding:0 20px;color:#14211d"><h1 style="font-size:24px">${t}</h1>${b}</body>`, { headers: { 'content-type': 'text/html; charset=utf-8' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const url = new URL(req.url)
  const route = url.pathname.split('/').pop()
  try {
    if (route === 'o' || route === 'r') {
      const c = Number(url.searchParams.get('c')); const st = Number(url.searchParams.get('s'))
      const ok = c && Number.isFinite(st) && (await sign(`t|${c}|${st}`)) === url.searchParams.get('h')
      if (ok) await db.rpc('bde_track_outreach', { p_contact: c, p_step: st, p_kind: route === 'o' ? 'open' : 'click' })
      if (route === 'o') return new Response(Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), (ch) => ch.charCodeAt(0)), { headers: { 'content-type': 'image/gif', 'cache-control': 'no-store, max-age=0' } })
      let to = url.searchParams.get('u') ?? SITE
      if (!to.startsWith(SITE)) to = SITE
      return new Response(null, { status: 302, headers: { location: to } })
    }
    if (route === 'u') {
      const id = Number(url.searchParams.get('c')); const ok = id && (await sign(`u|${id}`)) === url.searchParams.get('h')
      if (!ok) return page('Link not valid', '<p>This link is not valid.</p>')
      if (req.method === 'POST' || url.searchParams.get('confirm') === '1') {
        await db.from('bde_contacts').update({ status: 'unsubscribed', next_touch_at: null }).eq('id', id)
        return page('You are unsubscribed', '<p>BengalExport will not email you again.</p>')
      }
      return page('Stop emails from BengalExport?', '<form method="post"><button style="background:#0f6b5c;color:#fff;border:0;border-radius:8px;padding:12px 20px;font-size:16px">Yes, unsubscribe</button></form>')
    }
    const cron = await isCron(req); const admin = !cron && (await isAdmin(req))
    if (!cron && !admin) return Response.json({ error: 'Not allowed' }, { status: 403, headers: cors })
    const force = admin
    let out: unknown
    if (route === 'research') {
      let r: unknown; try { r = await researchDaily(force) } catch (e) { r = { error: clean(e).slice(0, 200) } }
      out = r
    }
    else if (route === 'send') out = await sendBatch(force)
    else if (route === 'morning') out = await morning(force)
    else if (route === 'channels') out = await channelsDaily(force)
    else if (route === 'replies') out = await repliesNow(force)
    else if (route === 'reply') { if (!admin) return Response.json({ error: 'Not allowed' }, { status: 403, headers: cors }); out = await sendReply(await req.json().catch(() => ({})), 'admin') }
    else if (route === 'status') {
      const cfg = await settings('autopilot')
      out = { ai: aiReady(), ai_provider: Deno.env.get('GEMINI_API_KEY') ? 'gemini' : Deno.env.get('ANTHROPIC_API_KEY') ? 'anthropic' : null, mailbox: mailboxReady(), mailbox_address: SMTP.user || null, enabled: !!cfg.enabled, cap_today: todaysCap(cfg), plan: await plan() }
    } else if (route === 'preview') {
      if (!aiReady()) return Response.json({ error: 'Connect the AI key first: research needs it.' }, { status: 400, headers: cors })
      const [t] = await plan(1)
      const found = await research(t, 3, false)
      const sample = found[0] ? await writeEmail({ ...found[0], id: 0 }, 0) : null
      out = { target: t, found, sample }
    } else return new Response('Not found', { status: 404, headers: cors })
    return Response.json(out, { headers: cors })
  } catch (e) {
    return Response.json({ error: clean(e).slice(0, 300) }, { status: 500, headers: cors })
  }
})
