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
  host: Deno.env.get('OUTREACH_SMTP_HOST') ?? 'smtp.hostinger.com',
  port: Number(Deno.env.get('OUTREACH_SMTP_PORT') ?? 465),
  user: Deno.env.get('OUTREACH_EMAIL') ?? '',
  pass: Deno.env.get('OUTREACH_PASSWORD') ?? '',
  imapHost: Deno.env.get('OUTREACH_IMAP_HOST') ?? 'imap.hostinger.com',
  imapPort: Number(Deno.env.get('OUTREACH_IMAP_PORT') ?? 993),
}
const mailboxReady = () => !!(SMTP.user && SMTP.pass)
const aiReady = () => !!(Deno.env.get('GEMINI_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY'))

// ---------- What we sell, to whom, where ----------
type Target = { fam: string; cat: string; label: string; buyers: string; markets: string[] }
const APPAREL = ['United Kingdom', 'Netherlands', 'France', 'Spain', 'Italy', 'Poland', 'Belgium', 'Denmark', 'Sweden', 'Ireland', 'Canada', 'Australia', 'Japan', 'United States', 'Germany']
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
  { fam: 'vegetables', cat: 'produce', label: 'fresh vegetables from Bangladesh', buyers: 'Asian and ethnic grocery importers, fresh produce importers', markets: ['United Kingdom', 'Italy', 'Malaysia', 'Singapore', 'Saudi Arabia', 'Netherlands'] },
  { fam: 'spices', cat: 'food', label: 'spices and aromatic rice', buyers: 'spice importers, Asian and ethnic food wholesalers', markets: ['United Kingdom', 'United States', 'Canada', 'Australia', 'Malaysia', 'Saudi Arabia', 'Italy'] },
  { fam: 'frozen', cat: 'food', label: 'frozen fish and shrimp', buyers: 'seafood importers, Asian food wholesalers', markets: ['United Kingdom', 'United States', 'Canada', 'Australia', 'Japan', 'Netherlands'] },
  { fam: 'handicrafts', cat: 'crafts', label: 'handicrafts and handloom', buyers: 'home decor and fair-trade importers, gift wholesalers', markets: APPAREL },
]
const DUTY_FREE = new Set(['United Kingdom', 'Netherlands', 'France', 'Spain', 'Italy', 'Poland', 'Belgium', 'Denmark', 'Sweden', 'Ireland', 'Germany', 'Austria', 'Canada', 'Australia', 'Japan', 'Norway', 'Switzerland', 'New Zealand'])
const UTC_OFFSET: Record<string, number> = { 'United Kingdom': 0, Ireland: 0, Netherlands: 1, France: 1, Spain: 1, Italy: 1, Poland: 1, Belgium: 1, Denmark: 1, Sweden: 1, Germany: 1, Austria: 1, Norway: 1, Switzerland: 1, Canada: -5, 'United States': -5, Australia: 10, Japan: 9, Malaysia: 8, Singapore: 8, 'Saudi Arabia': 3, 'New Zealand': 12 }
const ROLE = ['sales', 'purchasing', 'purchase', 'buying', 'buyer', 'sourcing', 'procurement', 'import', 'trade', 'info', 'contact', 'hello', 'office', 'enquiries', 'inquiries', 'mail', 'service', 'kontakt', 'admin']
const SKIP_DOMAINS = /(amazon|alibaba|ebay|etsy|facebook|linkedin|instagram|google|wikipedia|yelp|indiamart|made-in-china|tradekey|europages|kompass|yellowpages|zoominfo|bloomberg|dnb\.com|crunchbase|globalsources|exporthub|go4worldbusiness)\./i

// ---------- AI ----------
const COMPANY = `You work for BengalExport, an export trading house in Chattogram, Bangladesh (since 2022, about 22 people).
BengalExport sources from verified Bangladeshi factories and farms, checks the factory, inspects goods before shipping, and handles export packing, export customs, documents, freight and insurance. Prices are delivered to the buyer's port (CIF by sea, CIP by air). Payment only by 100% irrevocable LC at sight, so the buyer's money is safe until goods ship. Paid samples of ready styles ship within 24 hours. Most goods enter the EU, UK, Canada, Australia and Japan at 0% import duty. Never invent prices, certificates, customers, awards or facts.`

async function llm(system: string, prompt: string, opts: { json?: boolean; search?: boolean } = {}): Promise<string> {
  const g = Deno.env.get('GEMINI_API_KEY')
  if (g) {
    const body: Record<string, unknown> = { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, ...(opts.json && !opts.search ? { responseMimeType: 'application/json' } : {}) } }
    if (opts.search) body.tools = [{ google_search: {} }]
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${g}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`)
    const j = await r.json(); return j.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''
  }
  const a = Deno.env.get('ANTHROPIC_API_KEY')
  if (a) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': a, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-5-5', max_tokens: 3000, system, messages: [{ role: 'user', content: prompt + (opts.json ? '\nReply with JSON only, no other text.' : '') }], ...(opts.search ? { tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }] } : {}) }),
    })
    if (!r.ok) throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 200)}`)
    const j = await r.json(); return j.content?.filter((c: { type: string }) => c.type === 'text').map((c: { text?: string }) => c.text ?? '').join('') ?? ''
  }
  throw new Error('AI is not connected')
}
function parseJson<T>(s: string): T {
  const t = s.replace(/```(json)?/g, '').trim()
  const start = t.search(/[[{]/); const end = Math.max(t.lastIndexOf(']'), t.lastIndexOf('}'))
  return JSON.parse(t.slice(start, end + 1))
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
      if (demand) { score += Math.min(15, demand); why.push(`${demand} product view${demand > 1 ? 's' : ''} on the site`) }
      const asked = (leads ?? []).filter((l) => l.country === country).length
      if (asked) { score += asked * 6; why.push(`${asked} quote requests from ${country}`) }
      const done = (pros ?? []).filter((p) => p.country === country && (p.research as any)?.fam === t.fam)
      const replies = done.filter((p) => p.replied_at).length
      if (done.length >= 8) { const rate = replies / done.length; score += rate * 60 - done.length * 0.6; if (replies) why.push(`${replies} replies from ${done.length} contacted`) } else if (!done.length) { score += 4; why.push('new market to test') }
      score += Math.random() * 6 // keep exploring
      rows.push({ t, country, score, why })
    }
  }
  rows.sort((a, b) => b.score - a.score)
  const picked: typeof rows = []
  for (const r of rows) { if (picked.length >= n) break; if (!picked.some((p) => p.t.cat === r.t.cat || p.country === r.country)) picked.push(r) }
  return picked.map((p) => ({ fam: p.t.fam, label: p.t.label, country: p.country, buyers: p.t.buyers, why: p.why }))
}

// ---------- 2. Research: real companies with a public role email ----------
async function research(target: { fam: string; label: string; country: string; buyers: string }, want: number, save: boolean) {
  const { data: known } = await db.from('bde_contacts').select('email, website').limit(50000)
  const knownHosts = new Set((known ?? []).flatMap((k) => [hostOf(k.website ?? ''), String(k.email).split('@')[1]]).filter(Boolean))
  const text = await llm(COMPANY, `Use web search to find ${want + 6} real, currently operating companies in ${target.country} that buy or import ${target.label}: ${target.buyers}.
First choice: companies with evidence that they already import from Bangladesh (shipment records on ImportYeti, Panjiva or Volza, "made in Bangladesh" products, Bangladeshi suppliers named in news). Then small and mid-sized importers, wholesalers, distributors and private-label brands that source from Asia. Exclude marketplaces, directories, B2B portals, factories in Asia, and very large retailers.
Return a JSON array: [{"company": "...", "website": "https://...", "type": "importer|wholesaler|brand|distributor|promotional supplier", "why": "one short sentence on what they sell and why ${target.label} fits", "bd_evidence": "how we know they already buy from Bangladesh, or empty"}]. Only include companies whose website you actually found.`, { json: true, search: true })
  let list: { company: string; website: string; type: string; why: string; bd_evidence?: string }[] = []
  try { list = parseJson(text) } catch { list = [] }
  const out: Record<string, unknown>[] = []
  let noEmail = 0
  for (const c of list) {
    if (out.length >= want) break
    const host = hostOf(c.website ?? '')
    if (!host || knownHosts.has(host) || SKIP_DOMAINS.test(host)) continue
    knownHosts.add(host)
    const { email, contactUrl } = await findEmail(host)
    if (!email) {
      // No public email: hand it to the care team as a contact-form or LinkedIn task instead.
      if (save && noEmail++ < 4) await addTask(contactUrl ? 'contact_form' : 'linkedin', { company: c.company, country: target.country, label: target.label, why: c.why, url: contactUrl || linkedinSearch(c.company), website: `https://${host}` })
      continue
    }
    const row = { email, company: String(c.company).slice(0, 120), country: target.country, website: `https://${host}`, interests: [TARGETS.find((t) => t.fam === target.fam)?.cat ?? ''], tags: ['prospect', 'autopilot'], source: 'autopilot', status: 'subscribed', seq_step: 0, next_touch_at: new Date().toISOString(), research: { fam: target.fam, label: target.label, type: c.type, why: c.why, bd: c.bd_evidence || '', found_at: new Date().toISOString() }, score: c.bd_evidence ? 15 : 5 }
    if (save) { const { error } = await db.from('bde_contacts').insert(row); if (error) continue }
    out.push(row)
  }
  return out
}

// ---------- 3. Write and send ----------
function fallbackEmail(c: any, step: number) {
  const r = c.research ?? {}; const label = r.label ?? 'products'
  const duty = DUTY_FREE.has(c.country) ? ` They enter ${c.country} at 0% import duty.` : ''
  if (step === 0) return { subject: `${label[0].toUpperCase() + label.slice(1)} from Bangladesh`, body: `Hello,\n\nI saw that ${c.company} works with ${label}, so I wanted to introduce BengalExport. We supply ${label} from checked Bangladeshi factories, inspect every order before it ships, and quote one price delivered to your port.${duty}\n\nPayment is by LC at sight, so your money stays safe until the goods ship, and paid samples leave within 24 hours.\n\nWould it help if I sent prices delivered to your nearest port?` }
  if (step === 1) return { subject: `Re: ${label} from Bangladesh`, body: `Hello again,\n\nA quick follow-up: if it is easier to judge quality first, we can send paid samples of ready styles within 24 hours, and the cost is credited on your first order.\n\nShall I send a short price list for ${label}?` }
  return { subject: `Close the file?`, body: `Hello,\n\nI do not want to fill your inbox, so this is my last note. If ${label} from Bangladesh become interesting later, just reply to this email and I will send prices delivered to your port.\n\nThank you for your time.` }
}
async function writeEmail(c: any, step: number) {
  if (!aiReady()) return fallbackEmail(c, step)
  const r = c.research ?? {}
  const kind = ['first email', 'second email, sent 4 days after the first, with a new angle: samples in 24 hours and the inspection before shipping', 'third and last email, sent 6 days after the second: short, polite, gives them an easy way to say yes later'][step]
  try {
    const out = parseJson<{ subject: string; body: string }>(await llm(COMPANY, `Write the ${kind} of a cold B2B outreach from BengalExport to ${c.company} in ${c.country}.
What we know about them: ${r.type ?? 'company'}; ${r.why ?? ''}. Product to offer: ${r.label}.
${DUTY_FREE.has(c.country) ? `Goods from Bangladesh enter ${c.country} at 0% import duty: mention it once.` : 'Do not mention import duty.'}
Rules: plain text, 60-110 words, no greeting by personal name (we only have a company address, start with "Hello,"), first line specific to their business, one clear question as the call to action (for example whether to send prices delivered to their port), no links, no attachments, no exclamation marks, no spam words (free, guarantee, best price, cheap, urgent), no signature (it is added). Subject: 2-6 words, specific, lower-key${step ? ', may start with "Re: "' : ''}.
Return JSON {"subject": "...", "body": "..."}.`, { json: true }))
    if (out.subject && out.body && out.body.length < 1500) return out
  } catch { /* fall through */ }
  return fallbackEmail(c, step)
}
let transport: ReturnType<typeof nodemailer.createTransport> | null = null
function mailer() {
  transport ??= nodemailer.createTransport({ host: SMTP.host, port: SMTP.port, secure: SMTP.port === 465, auth: { user: SMTP.user, pass: SMTP.pass } })
  return transport
}
async function sendOne(c: any, step: number, cfg: Record<string, any>, address: string) {
  const { subject, body } = await writeEmail(c, step)
  const fam = c.research?.fam
  const link = `${SITE}products/${fam ? fam + '/' : ''}?utm_source=outreach&utm_medium=email&utm_campaign=c${c.id}`
  const unsub = `${FN}/u?c=${c.id}&h=${await sign(`u|${c.id}`)}`
  const signature = `\n\n${cfg.sender_name || 'BengalExport sales team'}\nBengalExport, Chattogram, Bangladesh\nWhatsApp +880 1805-070650\nCatalogue: ${link}\n\n${address ? address + '\n' : ''}If this is not relevant, reply "no" or unsubscribe here: ${unsub}`
  const info = await mailer().sendMail({ from: { name: cfg.sender_name || 'BengalExport', address: SMTP.user }, to: c.email, subject, text: body + signature, headers: { 'List-Unsubscribe': `<${unsub}>, <mailto:${SMTP.user}?subject=unsubscribe>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } })
  const now = new Date()
  const gap = step === 0 ? 4 : 6
  await db.from('bde_outreach').insert({ contact_id: c.id, step, subject, body, status: 'sent', message_id: info.messageId })
  await db.from('bde_contacts').update({ seq_step: step + 1, last_touch_at: now.toISOString(), next_touch_at: step + 1 >= 3 ? null : new Date(now.getTime() + gap * 864e5).toISOString() }).eq('id', c.id)
}
function todaysCap(cfg: Record<string, any>) {
  const start = cfg.warmup_start ? new Date(cfg.warmup_start).getTime() : Date.now()
  const days = Math.max(0, Math.floor((Date.now() - start) / 864e5))
  return Math.min(Number(cfg.daily_cap ?? 45), 10 + days * 4)
}
async function sendBatch(force = false) {
  const cfg = await settings('autopilot'); const email = await settings('email')
  if (!cfg.enabled && !force) return { skipped: 'autopilot is off' }
  if (!mailboxReady()) return { skipped: 'outreach mailbox not connected' }
  if (!cfg.warmup_start) { cfg.warmup_start = new Date().toISOString(); await db.from('bde_settings').update({ value: cfg }).eq('key', 'autopilot') }
  const since = new Date(); since.setUTCHours(0, 0, 0, 0)
  const { count: sentToday } = await db.from('bde_outreach').select('id', { count: 'exact', head: true }).gte('created_at', since.toISOString())
  const cap = todaysCap(cfg); const room = cap - (sentToday ?? 0)
  if (room <= 0) return { sent: 0, reason: `daily limit ${cap} reached` }
  const batch = force ? Math.min(room, 10) : Math.max(1, Math.ceil(room / 6)) // spread over the day, hourly runs
  const { data: due } = await db.from('bde_contacts').select('*').contains('tags', ['prospect']).eq('status', 'subscribed').is('replied_at', null).lt('seq_step', 3).lte('next_touch_at', new Date().toISOString()).order('seq_step', { ascending: false }).order('score', { ascending: false }).limit(200)
  let sent = 0; const errors: string[] = []
  for (const c of due ?? []) {
    if (sent >= batch) break
    const { h, dow } = localHour(c.country ?? '')
    if (!force && (dow === 0 || dow === 6 || h < 9 || h >= 16)) continue // their business hours only
    try { await sendOne(c, c.seq_step ?? 0, cfg, email.physical_address ?? ''); sent++ } catch (e) {
      errors.push(String(e).slice(0, 160))
      await db.from('bde_outreach').insert({ contact_id: c.id, step: c.seq_step ?? 0, subject: '-', body: '-', status: 'failed', error: String(e).slice(0, 300) })
      if (/auth|login|credential/i.test(String(e))) break
    }
    await new Promise((r) => setTimeout(r, 2500 + Math.random() * 3000))
  }
  return { sent, cap, errors }
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
      items.push({ uid: msg.uid, from, subject: m.subject ?? '', text, bounce: /mailer-daemon|postmaster/i.test(from) })
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
    out.push({ company: c.company, country: c.country, email: c.email, ...a })
  }
  return { items: out }
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
  try { replies = await readReplies() } catch (e) { replyError = String(e).slice(0, 200) }
  const clicks = await matchClicks()
  const since = new Date(Date.now() - 864e5).toISOString()
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
  try { rfq = await scanBuyingRequests() } catch (e) { rfq = { error: String(e).slice(0, 200) } }
  try { li = await linkedinFollowUps(5) } catch { /* next day */ }
  return { rfq, linkedin: li }
}

async function researchDaily(force = false) {
  const cfg = await settings('autopilot')
  if (!cfg.enabled && !force) return { skipped: 'autopilot is off' }
  if (!aiReady()) return { skipped: 'AI is not connected' }
  const { count: waiting } = await db.from('bde_contacts').select('id', { count: 'exact', head: true }).contains('tags', ['prospect']).eq('seq_step', 0).eq('status', 'subscribed')
  const need = Math.max(0, Number(cfg.daily_new ?? 15) - Math.floor((waiting ?? 0) / 3))
  if (!need) return { skipped: 'enough new buyers are waiting to be contacted', waiting }
  const targets = await plan(2)
  const results: any[] = []
  for (const t of targets) {
    try { const got = await research(t, Math.ceil(need / targets.length), true); results.push({ ...t, found: got.length, companies: got.map((g: any) => g.company) }) } catch (e) { results.push({ ...t, error: String(e).slice(0, 200) }) }
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
    if (route === 'research') out = await researchDaily(force)
    else if (route === 'send') out = await sendBatch(force)
    else if (route === 'morning') out = await morning(force)
    else if (route === 'channels') out = await channelsDaily(force)
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
    return Response.json({ error: String(e).slice(0, 300) }, { status: 500, headers: cors })
  }
})
