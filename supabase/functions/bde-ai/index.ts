// BengalExport AI assistant (admins only). Actions: reply_draft, campaign_write, weekly_report.
// Uses GEMINI_API_KEY (free tier) or ANTHROPIC_API_KEY, whichever is set.
import { createClient } from 'npm:@supabase/supabase-js@2'

const URL_ = Deno.env.get('SUPABASE_URL')!
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE = Deno.env.get('BDE_SITE_URL') ?? 'https://mosharafsm78-hub.github.io/bengal-delta-exports/'
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }

const COMPANY = `You write for BengalExport, an export trading house in Chattogram, Bangladesh (founded 2022, about 22 people).
It exports garments, footwear, home textiles, jute, fresh vegetables and fruit, food and spices, and handicrafts from verified Bangladeshi producers.
Terms: payment by 100% irrevocable LC at sight only. Prices are normally CIF to the buyer's port (CIP by air): product, export customs, freight and 110% cargo insurance included; the buyer clears import customs.
Paid samples of ready styles ship within 24 hours by express courier; sample cost is credited on the first order.
Most products enter the EU, UK, Canada, Australia and China at 0% duty (LDC rules). WhatsApp +880 1805-070650. Website ${SITE}.
Write in clear, warm, professional British English. Never invent prices, certificates, delivery dates or facts not given. Use placeholders like [price] where a number is needed.`

async function llm(system: string, prompt: string, json = false): Promise<string> {
  const g = Deno.env.get('GEMINI_API_KEY')
  if (g) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${g}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, ...(json ? { responseMimeType: 'application/json' } : {}) } }),
    })
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 200)}`)
    const j = await r.json(); return j.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''
  }
  const a = Deno.env.get('ANTHROPIC_API_KEY')
  if (a) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': a, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-5-5', max_tokens: 2000, system, messages: [{ role: 'user', content: prompt + (json ? '\nReply with JSON only.' : '') }] }),
    })
    if (!r.ok) throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 200)}`)
    const j = await r.json(); return j.content?.map((c: { text?: string }) => c.text ?? '').join('') ?? ''
  }
  throw new Error('AI is not connected yet. Add a free Gemini API key in Supabase (GEMINI_API_KEY) to switch it on.')
}

const parse = (s: string) => JSON.parse(s.replace(/^```(json)?|```$/gm, '').trim())

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const userDb = createClient(URL_, ANON, { global: { headers: { authorization: req.headers.get('authorization') ?? '' } }, auth: { persistSession: false } })
    const { data: ok } = await userDb.rpc('bde_is_admin')
    if (!ok) return Response.json({ error: 'Not allowed' }, { status: 403, headers: cors })
    const db = createClient(URL_, SERVICE, { auth: { persistSession: false } })
    const body = await req.json()

    if (body.action === 'status') return Response.json({ ai: !!(Deno.env.get('GEMINI_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY')) }, { headers: cors })

    if (body.action === 'buyer_analysis') {
      const { data: l } = await db.from('bde_leads').select('*').eq('id', body.leadId).single()
      const or = [l.contact_id ? `contact_id.eq.${l.contact_id}` : '', l.visitor_id ? `visitor_id.eq.${l.visitor_id}` : ''].filter(Boolean).join(',')
      const web = or ? (await db.from('bde_web_events').select('created_at, kind, path, label, product, utm_source, referrer, device, tz').or(or).order('created_at').limit(200)).data ?? [] : []
      const mail = l.contact_id ? (await db.from('bde_email_events').select('created_at, kind, url').eq('contact_id', l.contact_id).limit(100)).data ?? [] : []
      const notes = (await db.from('bde_activity').select('body').eq('entity', 'lead').eq('entity_id', body.leadId).limit(20)).data ?? []
      const prompt = `Analyse this buyer for the BengalExport team. Do NOT write a reply to the buyer.
Request: ${JSON.stringify({ name: l.name, company: l.company, email_domain: String(l.email).split('@')[1], website: l.website, country: l.country, port: l.port, buyer_type: l.buyer_type, items: l.items, requirement: l.requirement, quantity: l.quantity, unit: l.unit, incoterm: l.incoterm, needed_by: l.needed_by, certificates: l.certificates, notes: l.notes, stage: l.stage, received: l.created_at })}
Website behaviour (chronological): ${JSON.stringify(web)}
Email engagement: ${JSON.stringify(mail)}
Team notes: ${notes.map((n) => n.body).join(' | ') || 'none'}
Return JSON {"summary": "2 sentences: who they likely are and what they want", "intent": "high|medium|low", "signals": ["3-5 concrete buying signals from the data"], "risks": ["0-4 risk flags, e.g. free email, vague specs, unrealistic quantity, price shopping"], "next_step": "one specific action for the team", "care_team_note": "a short WhatsApp-style hand-over note (max 70 words) for the customer care team: who, what, where, what to ask or send"}. Base it strictly on the data.`
      return Response.json(parse(await llm(COMPANY, prompt, true)), { headers: cors })
    }

    if (body.action === 'ask') {
      const since = new Date(Date.now() - 60 * 864e5).toISOString()
      const [leads, web, sends, sup, contacts, camps] = await Promise.all([
        db.from('bde_leads').select('created_at, stage, country, buyer_type, items, deal_value_usd, visitor_id').gte('created_at', since),
        db.from('bde_web_events').select('created_at, visitor_id, kind, path, label, product, category, utm_source, referrer, device, tz, campaign_id').gte('created_at', since).limit(50000),
        db.from('bde_sends').select('campaign_id, status, open_count, click_count, first_open_at').gte('created_at', since).limit(50000),
        db.from('bde_suppliers').select('stage, categories, district, created_at, rating'),
        db.from('bde_contacts').select('country, status, score, interests, tags').limit(20000),
        db.from('bde_campaigns').select('id, name, subject, status, sent_at'),
      ])
      const tally = (rows: Record<string, unknown>[], f: (r: Record<string, unknown>) => unknown) => Object.entries(rows.reduce((m: Record<string, number>, r) => { const v = f(r); if (v) for (const x of ([] as unknown[]).concat(v)) m[String(x)] = (m[String(x)] ?? 0) + 1; return m }, {})).sort((a, b) => b[1] - a[1]).slice(0, 12)
      const W = web.data ?? []
      const buyers = new Set(W.filter((e) => e.kind === 'quote_submitted').map((e) => e.visitor_id))
      const bW = W.filter((e) => buyers.has(e.visitor_id)), oW = W.filter((e) => !buyers.has(e.visitor_id))
      const host = (r: unknown) => { try { return r ? new URL(String(r)).hostname : null } catch { return null } }
      const facts = {
        period: 'last 60 days', visitors: new Set(W.map((e) => e.visitor_id)).size, quote_visitors: buyers.size,
        leads_total: (leads.data ?? []).length, leads_by_stage: tally(leads.data ?? [], (r) => r.stage), leads_by_country: tally(leads.data ?? [], (r) => r.country), leads_by_buyer_type: tally(leads.data ?? [], (r) => r.buyer_type),
        products_requested: tally(leads.data ?? [], (r) => ((r.items as { style: string }[]) ?? []).map((i) => i.style)), pipeline_value_usd: (leads.data ?? []).reduce((s, r) => s + Number(r.deal_value_usd || 0), 0),
        top_products_viewed: tally(W.filter((e) => e.kind === 'product_view'), (r) => r.product), top_categories: tally(W.filter((e) => e.category), (r) => r.category),
        sections_read_by_buyers: tally(bW.filter((e) => e.kind === 'section_view'), (r) => r.label), sections_read_by_non_buyers: tally(oW.filter((e) => e.kind === 'section_view'), (r) => r.label),
        pages_buyers: tally(bW.filter((e) => e.kind.endsWith('view')), (r) => r.path), traffic_sources: tally(W, (r) => (r.utm_source === 'email' ? 'our emails' : host(r.referrer) ?? 'direct')), buyer_sources: tally(bW, (r) => (r.utm_source === 'email' ? 'our emails' : host(r.referrer) ?? 'direct')),
        devices: tally(W, (r) => r.device), timezones: tally(W, (r) => r.tz), clicks: tally(W.filter((e) => e.kind.endsWith('click')), (r) => `${r.kind}: ${r.label ?? ''}`),
        emails_sent: (sends.data ?? []).filter((s) => s.status === 'sent').length, emails_opened: (sends.data ?? []).filter((s) => s.open_count).length, emails_clicked: (sends.data ?? []).filter((s) => s.click_count).length,
        campaigns: (camps.data ?? []).map((c) => ({ ...c, sent: (sends.data ?? []).filter((s) => s.campaign_id === c.id && s.status === 'sent').length, opened: (sends.data ?? []).filter((s) => s.campaign_id === c.id && s.open_count).length, clicked: (sends.data ?? []).filter((s) => s.campaign_id === c.id && s.click_count).length })),
        contacts_by_status: tally(contacts.data ?? [], (r) => r.status), contacts_by_country: tally(contacts.data ?? [], (r) => r.country), contact_interests: tally(contacts.data ?? [], (r) => r.interests),
        suppliers_by_stage: tally(sup.data ?? [], (r) => r.stage), supplier_categories: tally(sup.data ?? [], (r) => r.categories),
      }
      const history = (body.history ?? []).slice(-6).map((m: { role: string; text: string }) => `${m.role}: ${m.text}`).join('\n')
      const prompt = `You are the business analyst inside BengalExport's admin panel. Answer the owner's question using ONLY these facts (aggregated from the database): ${JSON.stringify(facts)}
${history ? `Conversation so far:\n${history}\n` : ''}Question: ${body.question}
Answer in plain language: the direct answer first, then the evidence (numbers), then 1-3 concrete actions. Max 200 words. If the data is too thin to answer, say exactly what data is missing and how to get it.`
      return Response.json({ answer: await llm(COMPANY, prompt) }, { headers: cors })
    }

    if (body.action === 'campaign_write') {
      const prompt = `Write a B2B marketing email. Brief: ${body.brief}. Audience: ${body.audience ?? 'importers and wholesalers'}.
Return JSON {"subjects": [3 subject options under 55 characters, at least one using {{company}}], "intro": "opening paragraph after 'Hello {{first_name}},' (max 60 words)", "products": [exactly 3 objects {"title","line"} — short], "closing": "one sentence (max 30 words)", "button": "button text (max 4 words)"}.`
      return Response.json(parse(await llm(COMPANY, prompt, true)), { headers: cors })
    }

    if (body.action === 'weekly_report') {
      const since = new Date(Date.now() - 7 * 864e5).toISOString()
      const [leads, web, sends, sup] = await Promise.all([
        db.from('bde_leads').select('created_at, stage, country, company, items, deal_value_usd').gte('created_at', since),
        db.from('bde_web_events').select('kind, product, category, utm_source').gte('created_at', since).limit(20000),
        db.from('bde_sends').select('status, open_count, click_count').gte('created_at', since),
        db.from('bde_suppliers').select('stage, created_at'),
      ])
      const count = (rows: Record<string, unknown>[] | null, k: string) => Object.entries((rows ?? []).reduce((m: Record<string, number>, r) => { const v = String(r[k] ?? ''); if (v) m[v] = (m[v] ?? 0) + 1; return m }, {})).sort((a, b) => b[1] - a[1]).slice(0, 8)
      const facts = { new_quote_requests: leads.data?.length ?? 0, leads_by_country: count(leads.data, 'country'), leads_by_stage: count(leads.data, 'stage'), web_events_by_kind: count(web.data, 'kind'), top_products_viewed: count((web.data ?? []).filter((e) => e.kind === 'product_view'), 'product'), emails_sent: (sends.data ?? []).filter((s) => s.status === 'sent').length, emails_opened: (sends.data ?? []).filter((s) => s.open_count).length, emails_clicked: (sends.data ?? []).filter((s) => s.click_count).length, suppliers_by_stage: count(sup.data, 'stage') }
      const prompt = `Here are BengalExport's numbers for the last 7 days: ${JSON.stringify(facts)}.
Write a short weekly report for the owner: 3 headline findings, then 3 specific actions for next week. Plain text, bullet points, max 180 words. Base everything strictly on these numbers; if data is thin, say so.`
      return Response.json({ report: await llm(COMPANY, prompt) }, { headers: cors })
    }
    return Response.json({ error: 'Unknown action' }, { status: 400, headers: cors })
  } catch (e) {
    return Response.json({ error: String((e as Error).message ?? e).slice(0, 300) }, { status: 500, headers: cors })
  }
})
