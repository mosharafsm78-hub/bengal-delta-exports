// BengalExport Buyer Desk: free buyer accounts, verification, personal agent (human + AI).
// POST /signup /verify /resend /reset-start /reset-finish (public), /me /chat /request /profile (signed-in buyer)
import { createClient } from 'npm:@supabase/supabase-js@2'
import nodemailer from 'npm:nodemailer@6.9.16'

const URL_ = Deno.env.get('SUPABASE_URL')!
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE = Deno.env.get('BDE_SITE_URL') ?? 'https://bengalexport.online/'
const db = createClient(URL_, SERVICE, { auth: { persistSession: false } })
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const SMTP = { host: Deno.env.get('OUTREACH_SMTP_HOST') ?? 'mail.privateemail.com', port: Number(Deno.env.get('OUTREACH_SMTP_PORT') ?? 465), user: Deno.env.get('OUTREACH_EMAIL') ?? '', pass: Deno.env.get('OUTREACH_PASSWORD') ?? '' }
const FREE_MAIL = /^(gmail|googlemail|yahoo|ymail|hotmail|outlook|live|msn|icloud|me|mac|aol|proton|protonmail|pm|gmx|web|mail|yandex|qq|163|126|zoho|rediffmail|seznam|wp|o2|libero|laposte|orange|free|t-online|btinternet|naver|daum)\./i
const AI_PER_DAY = 60

const json = (b: unknown, status = 200) => Response.json(b, { status, headers: cors })
const clean = (e: unknown) => String((e as Error)?.message ?? e).replace(/sk-ant-[A-Za-z0-9_-]+/g, '[key]').slice(0, 300)
const hostOf = (u: string) => { try { return new URL(u.startsWith('http') ? u : `https://${u}`).hostname.replace(/^www\./, '').toLowerCase() } catch { return '' } }
const base = (h: string) => { const p = h.split('.'); return (p.length > 2 && p[p.length - 1].length === 2 && /^(co|com|org|net|ac|gov|ltd|plc)$/.test(p[p.length - 2]) ? p.slice(-3) : p.slice(-2)).join('.') }
async function sha(s: string) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s + SERVICE.slice(-16))))).map((b) => b.toString(16).padStart(2, '0')).join('') }
const code6 = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, '0')

let tx: ReturnType<typeof nodemailer.createTransport> | null = null
async function mail(to: string, subject: string, text: string) {
  if (!SMTP.user || !SMTP.pass) throw new Error('Email is not set up yet')
  tx ??= nodemailer.createTransport({ host: SMTP.host, port: SMTP.port, secure: SMTP.port === 465, auth: { user: SMTP.user, pass: SMTP.pass } })
  await tx.sendMail({ from: { name: 'BengalExport Buyer Desk', address: SMTP.user }, to, subject, text })
}
async function sendCode(email: string, name: string, purpose: 'verify' | 'reset') {
  const code = code6()
  await db.from('bde_buyers').update({ code_hash: await sha(`${email.toLowerCase()}|${code}`), code_expires: new Date(Date.now() + 30 * 6e4).toISOString() }).eq('email', email)
  await mail(email, `${code} is your BengalExport code`, `Hello ${name},\n\nYour BengalExport ${purpose === 'verify' ? 'verification' : 'password reset'} code is:\n\n${code}\n\nIt works for 30 minutes. If you did not ask for it, you can ignore this email.\n\nBengalExport Buyer Desk\n${SITE}`)
}
async function checkCode(email: string, code: string) {
  const { data: b } = await db.from('bde_buyers').select('*').eq('email', email).maybeSingle()
  if (!b || !b.code_hash || !b.code_expires || new Date(b.code_expires) < new Date()) return null
  return b.code_hash === (await sha(`${email.toLowerCase()}|${String(code).trim()}`)) ? b : null
}
async function hasMx(d: string) { try { const j = await (await fetch(`https://dns.google/resolve?name=${encodeURIComponent(d)}&type=MX`)).json(); return (j.Answer ?? []).some((a: { type: number }) => a.type === 15) } catch { return false } }
async function siteLive(h: string) { try { const r = await fetch(`https://${h}`, { redirect: 'follow', signal: AbortSignal.timeout(8000) }); return r.ok } catch { return false } }

/** Automatic checks. Pass all → Verified at once; otherwise our team reviews within one business day. */
async function verifyBuyer(b: Record<string, any>) {
  const dom = String(b.email).split('@')[1].toLowerCase()
  const web = hostOf(b.website ?? '')
  const checks = {
    email_confirmed: true,
    company_email: !FREE_MAIL.test(dom + '.'),
    email_matches_website: !!web && base(web) === base(dom),
    mail_server: await hasMx(dom),
    website_live: web ? await siteLive(web) : false,
    company_number: !!(b.company_number && String(b.company_number).trim().length >= 4),
  }
  const auto = checks.company_email && checks.email_matches_website && checks.mail_server && checks.website_live
  const status = auto ? 'verified' : 'review'
  let agent_id = b.agent_id
  if (auto && !agent_id) agent_id = await pickAgent()
  await db.from('bde_buyers').update({ email_verified: true, code_hash: null, checks, status, verified_at: auto ? new Date().toISOString() : null, agent_id }).eq('user_id', b.user_id)
  await db.from('bde_buyer_messages').insert({ buyer_id: b.user_id, sender: 'system', body: auto ? 'Your company is verified. Your personal sourcing agent is now assigned to you, and the AI assistant can answer at any time.' : 'Thank you. Our team checks your company within one business day (we could not confirm it automatically). You can already post requests; your personal agent is assigned once you are verified.' })
  try { const { data: s } = await db.from('bde_settings').select('value').eq('key', 'autopilot').maybeSingle(); const to = (s?.value as any)?.report_email; if (to) await mail(to, `New buyer account: ${b.company} (${b.country})${auto ? ' · verified' : ' · needs review'}`, `${b.name}, ${b.company}, ${b.country}\n${b.email} · ${b.website ?? 'no website'}\nType: ${b.buyer_type ?? '-'} · Volume: ${b.yearly_volume ?? '-'}\nChecks: ${JSON.stringify(checks)}\n\nOpen the admin panel: ${SITE}admin`) } catch { /* not critical */ }
  return { status, checks }
}
async function pickAgent() {
  const { data: agents } = await db.from('bde_agents').select('id').eq('active', true)
  if (!agents?.length) return null
  const { data: load } = await db.from('bde_buyers').select('agent_id').not('agent_id', 'is', null)
  const n = (id: number) => (load ?? []).filter((l) => l.agent_id === id).length
  return agents.sort((a, b) => n(a.id) - n(b.id))[0].id
}

// ---------- AI agent ----------
let catalogue = ''
async function catalog() {
  if (catalogue) return catalogue
  try { const j = await (await fetch(`${SITE}catalog.json`)).json(); catalogue = (j as any[]).map((f) => `${f.name} [${f.id}] MOQ ${f.moq}; lead ${f.lead}; items: ${f.styles.map((s: any[]) => `${s[0]} $${s[1]}-${s[2]}/${s[3]}`).join(', ')}`).join('\n') } catch { catalogue = '(catalogue unavailable)' }
  return catalogue
}
async function llm(system: string, prompt: string) {
  const g = Deno.env.get('GEMINI_API_KEY')
  if (g) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${g}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, responseMimeType: 'application/json' } }) })
    if (!r.ok) throw new Error(`AI ${r.status}`)
    return (await r.json()).candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? ''
  }
  const a = (Deno.env.get('ANTHROPIC_API_KEY') ?? '').match(/sk-ant-[A-Za-z0-9_-]+/)?.[0]
  if (!a) throw new Error('AI is not connected')
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': a, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify({ model: Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-5-5', max_tokens: 1200, system, messages: [{ role: 'user', content: prompt + '\nReply with JSON only.' }] }) })
  if (!r.ok) throw new Error(`AI ${r.status}`)
  return (await r.json()).content?.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('') ?? ''
}
const parse = (s: string) => { const t = s.replace(/```(json)?/g, ''); return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)) }

async function chat(b: Record<string, any>, text: string) {
  const today = new Date().toISOString().slice(0, 10)
  const used = b.ai_day === today ? b.ai_today ?? 0 : 0
  await db.from('bde_buyer_messages').insert({ buyer_id: b.user_id, sender: 'buyer', body: text.slice(0, 4000) })
  const { data: agent } = b.agent_id ? await db.from('bde_agents').select('*').eq('id', b.agent_id).maybeSingle() : { data: null }
  const agentName = agent?.name ?? 'the BengalExport buyer desk'
  if (used >= AI_PER_DAY) {
    await db.from('bde_buyer_messages').update({ needs_human: true }).eq('buyer_id', b.user_id).eq('sender', 'buyer').eq('handled', false)
    const body = `You have reached today's limit for the AI assistant. ${agentName} has your message and will reply.`
    await db.from('bde_buyer_messages').insert({ buyer_id: b.user_id, sender: 'ai', body })
    return { reply: body }
  }
  const [{ data: leads }, { data: hist }] = await Promise.all([
    db.from('bde_leads').select('id, reference, created_at, items, requirement, quantity, unit, country, port, stage').ilike('email', b.email.replace(/[\\%_]/g, '\\$&')).order('created_at', { ascending: false }).limit(10),
    db.from('bde_buyer_messages').select('sender, body, created_at').eq('buyer_id', b.user_id).order('created_at', { ascending: false }).limit(16),
  ])
  const system = `You are the AI assistant inside BengalExport's Buyer Desk, working alongside the buyer's personal sourcing agent, ${agentName}. You are an AI and say so if asked; never pretend to be ${agentName}.
BengalExport is an export trading house in Bangladesh. We source from checked Bangladeshi factories and farms, inspect every order before shipping, and handle export packing, customs, documents, freight and insurance. Prices are quoted delivered to the buyer's port (CIF by sea, CIP by air). Payment only by 100% irrevocable LC at sight. Paid samples of ready styles ship within 24 hours; sample cost is credited on the first order. Most goods enter the EU, UK, Canada, Australia and Japan at 0% import duty. Free offers within 24 hours. WhatsApp +880 1805-070650.
Catalogue (indicative FOB USD ranges, final price is in the firm offer):
${await catalog()}
Rules: be concise, warm and specific (max 120 words). Use catalogue ranges only as "indicative"; never promise a firm price, discount, delivery date, certificate or anything not stated here. Ask for missing details (product, specification, quantity, destination port, timing). When the buyer clearly wants an offer or sourcing for a specific product and gave at least product and quantity, create a request. Hand over to ${agentName} (needs_human true) for negotiation, complaints, contracts, payment questions beyond the basics, or when the buyer asks for a person.
Return JSON {"reply": "...", "needs_human": false, "request": null or {"product": "...", "family": "catalogue id or other", "quantity": "...", "unit": "...", "port": "...", "details": "specification and anything else"}}.`
  const prompt = `Buyer: ${b.name}, ${b.company}, ${b.country} (${b.buyer_type ?? 'buyer'}), status ${b.status}.
Their requests: ${JSON.stringify(leads ?? [])}
Conversation (newest last): ${(hist ?? []).reverse().map((m) => `${m.sender}: ${m.body}`).join('\n')}`
  let out: { reply: string; needs_human?: boolean; request?: any } = { reply: '' }
  try { out = parse(await llm(system, prompt)) } catch (e) { out = { reply: `I could not answer just now. ${agentName} has your message and will reply soon.`, needs_human: true }; console.error(clean(e)) }
  let leadId: number | null = null
  if (out.request?.product) {
    const ref = `BDE-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const { data: l } = await db.from('bde_leads').insert({ kind: 'requirement', reference: ref, items: [{ family: out.request.family ?? 'other', style: out.request.product, qty: out.request.quantity }], requirement: out.request.details ?? '', quantity: String(out.request.quantity ?? '-'), unit: out.request.unit ?? null, country: b.country, port: out.request.port ?? null, incoterm: 'CIF to my port (recommended)', certificates: [], company: b.company, buyer_type: b.buyer_type, name: b.name, email: b.email, phone: b.phone, website: b.website, consent: true, source_page: 'buyer-desk', notes: 'Created by the Buyer Desk AI assistant from the buyer chat' }).select('id').single()
    leadId = l?.id ?? null
    if (leadId) out.reply += `\n\nI have opened request ${ref} for you. ${agentName} will send your free offer within 24 hours.`
  }
  if (out.needs_human) await db.from('bde_buyer_messages').update({ needs_human: true }).eq('buyer_id', b.user_id).eq('sender', 'buyer').eq('handled', false)
  await db.from('bde_buyer_messages').insert({ buyer_id: b.user_id, sender: 'ai', body: out.reply.slice(0, 3000), lead_id: leadId })
  await db.from('bde_buyers').update({ ai_today: used + 1, ai_day: today, last_seen: new Date().toISOString() }).eq('user_id', b.user_id)
  if (out.needs_human && agent?.email) { try { await mail(agent.email, `Buyer needs you: ${b.company} (${b.country})`, `${b.name} from ${b.company} wrote:\n\n${text}\n\nReply in the admin panel: ${SITE}admin#buyers`) } catch { /* panel still shows it */ } }
  return { reply: out.reply, needs_human: !!out.needs_human, lead_id: leadId }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const route = new URL(req.url).pathname.split('/').pop()
  try {
    const body = await req.json().catch(() => ({}))
    // ---------- public ----------
    if (route === 'signup') {
      if (body.website_url) return json({ ok: true }) // honeypot
      const email = String(body.email ?? '').trim().toLowerCase()
      const need = ['name', 'company', 'country'].filter((k) => !String(body[k] ?? '').trim())
      if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email) || need.length) return json({ error: 'Please fill in your name, company, country and a valid email.' }, 400)
      if (String(body.password ?? '').length < 8) return json({ error: 'Please choose a password of at least 8 characters.' }, 400)
      const { count } = await db.from('bde_buyers').select('user_id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 36e5).toISOString())
      if ((count ?? 0) > 40) return json({ error: 'Too many sign-ups right now. Please try again in an hour.' }, 429)
      const { data: existing } = await db.from('bde_buyers').select('user_id').eq('email', email).maybeSingle()
      if (existing) return json({ error: 'An account with this email already exists. Please sign in, or reset your password.' }, 409)
      const { data: u, error } = await db.auth.admin.createUser({ email, password: body.password, email_confirm: true, user_metadata: { role: 'buyer' } })
      if (error || !u.user) return json({ error: /registered/i.test(error?.message ?? '') ? 'An account with this email already exists. Please sign in.' : 'Could not create the account. Please try again.' }, 400)
      const row = { user_id: u.user.id, email, name: String(body.name).trim().slice(0, 80), company: String(body.company).trim().slice(0, 120), country: String(body.country).trim().slice(0, 60), website: String(body.website ?? '').trim().slice(0, 200) || null, phone: String(body.phone ?? '').trim().slice(0, 40) || null, buyer_type: body.buyer_type ?? null, yearly_volume: body.yearly_volume ?? null, interests: Array.isArray(body.interests) ? body.interests.slice(0, 10) : [], company_number: String(body.company_number ?? '').trim().slice(0, 40) || null }
      const { error: e2 } = await db.from('bde_buyers').insert(row)
      if (e2) { await db.auth.admin.deleteUser(u.user.id); return json({ error: 'Could not create the account. Please try again.' }, 400) }
      await db.from('bde_buyer_messages').insert({ buyer_id: u.user.id, sender: 'system', body: `Welcome to BengalExport, ${row.name}. Confirm your email with the 6-digit code we sent to unlock your Verified buyer badge and personal agent.` })
      try { await sendCode(email, row.name, 'verify') } catch (e) { return json({ ok: true, warning: 'Account created, but the code email could not be sent. Use "Send a new code".' }) }
      return json({ ok: true })
    }
    if (route === 'reset-start') {
      const email = String(body.email ?? '').trim().toLowerCase()
      const { data: b } = await db.from('bde_buyers').select('name, code_sends').eq('email', email).maybeSingle()
      if (b && (b.code_sends ?? 0) < 12) { await db.from('bde_buyers').update({ code_sends: (b.code_sends ?? 0) + 1 }).eq('email', email); try { await sendCode(email, b.name, 'reset') } catch { /* same answer */ } }
      return json({ ok: true }) // same answer either way
    }
    if (route === 'reset-finish') {
      const email = String(body.email ?? '').trim().toLowerCase()
      if (String(body.password ?? '').length < 8) return json({ error: 'Please choose a password of at least 8 characters.' }, 400)
      const b = await checkCode(email, body.code)
      if (!b) return json({ error: 'The code is wrong or expired. Ask for a new one.' }, 400)
      await db.auth.admin.updateUserById(b.user_id, { password: body.password })
      await db.from('bde_buyers').update({ code_hash: null, email_verified: true }).eq('user_id', b.user_id)
      return json({ ok: true })
    }
    // ---------- signed-in buyer ----------
    const token = (req.headers.get('authorization') ?? '').replace(/^Bearer /i, '')
    const { data: who } = await db.auth.getUser(token)
    if (!who?.user) return json({ error: 'Please sign in again.' }, 401)
    const { data: b } = await db.from('bde_buyers').select('*').eq('user_id', who.user.id).maybeSingle()
    if (!b) return json({ error: 'No buyer account for this login.' }, 403)

    if (route === 'verify') {
      if (b.email_verified) return json({ ok: true, status: b.status })
      const ok = await checkCode(b.email, body.code)
      if (!ok) return json({ error: 'The code is wrong or expired. Ask for a new one.' }, 400)
      return json({ ok: true, ...(await verifyBuyer(b)) })
    }
    if (route === 'resend') {
      if ((b.code_sends ?? 0) >= 12) return json({ error: 'Too many codes. Please contact us on WhatsApp.' }, 429)
      await db.from('bde_buyers').update({ code_sends: (b.code_sends ?? 0) + 1 }).eq('user_id', b.user_id)
      await sendCode(b.email, b.name, 'verify')
      return json({ ok: true })
    }
    if (route === 'profile') {
      const allowed = ['name', 'company', 'country', 'website', 'phone', 'buyer_type', 'yearly_volume', 'interests', 'company_number'] as const
      const patch: Record<string, unknown> = {}
      for (const k of allowed) if (k in body) patch[k] = typeof body[k] === 'string' ? body[k].trim().slice(0, 200) : body[k]
      await db.from('bde_buyers').update(patch).eq('user_id', b.user_id)
      const fresh = { ...b, ...patch }
      if (b.email_verified && b.status === 'review') return json({ ok: true, ...(await verifyBuyer(fresh)) })
      return json({ ok: true })
    }
    if (!b.email_verified) return json({ error: 'Please confirm your email first.' }, 403)
    if (route === 'chat') {
      const text = String(body.message ?? '').trim()
      if (!text) return json({ error: 'Empty message' }, 400)
      return json(await chat(b, text))
    }
    if (route === 'request') {
      if (!String(body.product ?? '').trim() || !String(body.quantity ?? '').trim()) return json({ error: 'Please give the product and quantity.' }, 400)
      const ref = `BDE-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const { data: l, error } = await db.from('bde_leads').insert({ kind: 'requirement', reference: ref, items: [{ family: body.family ?? 'other', style: String(body.product).slice(0, 160), qty: String(body.quantity), spec: body.link ?? undefined, estimate: body.target_price ? `target ${body.target_price}` : undefined }], requirement: String(body.details ?? '').slice(0, 3000), quantity: String(body.quantity).slice(0, 60), unit: body.unit ?? null, country: b.country, port: body.port ?? null, incoterm: 'CIF to my port (recommended)', needed_by: body.needed_by ?? null, certificates: Array.isArray(body.certificates) ? body.certificates : [], company: b.company, buyer_type: b.buyer_type, name: b.name, email: b.email, phone: b.phone, website: b.website, consent: true, source_page: 'buyer-desk', notes: `Sourcing request from a ${b.status} buyer account` }).select('id, reference').single()
      if (error) return json({ error: 'Could not save the request. Please try again.' }, 500)
      await db.from('bde_buyer_messages').insert({ buyer_id: b.user_id, sender: 'system', body: `Request ${ref} received: ${body.product}, ${body.quantity}. You get a free offer within 24 hours (48 hours for products outside our catalogue).`, lead_id: l.id })
      return json({ ok: true, reference: l.reference })
    }
    return json({ error: 'Not found' }, 404)
  } catch (e) {
    console.error(clean(e))
    return json({ error: 'Something went wrong. Please try again.' }, 500)
  }
})
