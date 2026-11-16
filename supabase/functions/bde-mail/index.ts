// BengalExport email engine: open pixel, click redirect, unsubscribe, campaign sending.
// Routes: GET /o?s=  GET /c?s=&u=&h=  GET|POST /u?s=  POST /send {campaignId, test?}
import { createClient } from 'npm:@supabase/supabase-js@2'

const URL_ = Deno.env.get('SUPABASE_URL')!
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON = Deno.env.get('SUPABASE_ANON_KEY')!
const SITE = Deno.env.get('BDE_SITE_URL') ?? 'https://mosharafsm78-hub.github.io/bengal-delta-exports/'
const db = createClient(URL_, SERVICE, { auth: { persistSession: false } })
const FN = `${URL_}/functions/v1/bde-mail`

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}
const PIXEL = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), (c) => c.charCodeAt(0))
const isUuid = (s: string | null) => !!s && /^[0-9a-f-]{36}$/i.test(s)

async function sign(text: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SERVICE), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text))
  return Array.from(new Uint8Array(sig)).slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function record(sendId: string, kind: 'open' | 'click' | 'unsubscribe', req: Request, url?: string) {
  const { data: s } = await db.from('bde_sends').select('id, campaign_id, contact_id, open_count, click_count, first_open_at, first_click_at').eq('id', sendId).maybeSingle()
  if (!s) return null
  const now = new Date().toISOString()
  await db.from('bde_email_events').insert({ send_id: s.id, campaign_id: s.campaign_id, contact_id: s.contact_id, kind, url, country: req.headers.get('cf-ipcountry'), user_agent: req.headers.get('user-agent')?.slice(0, 300) })
  if (kind === 'open') {
    await db.from('bde_sends').update({ open_count: s.open_count + 1, first_open_at: s.first_open_at ?? now }).eq('id', s.id)
    await db.rpc('bde_bump_contact', { cid: s.contact_id, pts: 1, field: 'open' })
  } else if (kind === 'click') {
    await db.from('bde_sends').update({ click_count: s.click_count + 1, first_click_at: s.first_click_at ?? now, open_count: Math.max(1, s.open_count), first_open_at: s.first_open_at ?? now }).eq('id', s.id)
    await db.rpc('bde_bump_contact', { cid: s.contact_id, pts: 5, field: 'click' })
  } else {
    await db.from('bde_contacts').update({ status: 'unsubscribed' }).eq('id', s.contact_id)
  }
  return s
}

function page(title: string, body: string) {
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="font-family:system-ui,sans-serif;max-width:520px;margin:12vh auto;padding:0 20px;color:#14211d"><h1 style="font-size:24px">${title}</h1>${body}<p style="margin-top:32px"><a href="${SITE}" style="color:#0f6b5c">BengalExport</a></p></body>`, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}

/** Personalise, add open pixel, rewrite links for click tracking, add unsubscribe footer. */
async function render(html: string, c: Record<string, string | null>, sendId: string, campaignId: number, address: string) {
  const fill = (s: string) => s.replace(/\{\{\s*(name|first_name|company|country)\s*\}\}/g, (_, k) => {
    const v = k === 'first_name' ? (c.name ?? '').split(' ')[0] : c[k]
    return (v || (k === 'company' ? 'your company' : k === 'country' ? 'your market' : 'there')).replace(/[<>&"]/g, '')
  })
  let out = fill(html)
  const links = [...out.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1])
  for (const raw of new Set(links)) {
    let target = raw
    if (raw.startsWith(SITE)) {
      const u = new URL(raw)
      u.searchParams.set('e', sendId)
      u.searchParams.set('utm_source', 'email')
      u.searchParams.set('utm_medium', 'email')
      u.searchParams.set('utm_campaign', String(campaignId))
      target = u.toString()
    }
    const h = await sign(`${sendId}|${target}`)
    out = out.split(`href="${raw}"`).join(`href="${FN}/c?s=${sendId}&u=${encodeURIComponent(target)}&h=${h}"`)
  }
  const unsub = `${FN}/u?s=${sendId}`
  out += `<div style="font:12px/1.5 system-ui,sans-serif;color:#6b7470;margin-top:28px;border-top:1px solid #e4e7e5;padding-top:14px">BengalExport · ${address}<br>You are receiving this because you trade in products we export. <a href="${unsub}" style="color:#6b7470">Unsubscribe</a></div><img src="${FN}/o?s=${sendId}" width="1" height="1" alt="" style="display:block;border:0">`
  return { html: out, subjectFill: fill, unsub }
}

async function deliver(provider: string, msg: { from: string; fromName: string; replyTo?: string; to: string; subject: string; html: string; unsub: string }) {
  if (provider === 'brevo') {
    const key = Deno.env.get('BREVO_API_KEY'); if (!key) throw new Error('BREVO_API_KEY is not set')
    const r = await fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': key, 'content-type': 'application/json' }, body: JSON.stringify({ sender: { email: msg.from, name: msg.fromName }, to: [{ email: msg.to }], replyTo: msg.replyTo ? { email: msg.replyTo } : undefined, subject: msg.subject, htmlContent: msg.html, headers: { 'List-Unsubscribe': `<${msg.unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } }) })
    if (!r.ok) throw new Error(`Brevo ${r.status}: ${(await r.text()).slice(0, 200)}`)
  } else if (provider === 'resend') {
    const key = Deno.env.get('RESEND_API_KEY'); if (!key) throw new Error('RESEND_API_KEY is not set')
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: `${msg.fromName} <${msg.from}>`, to: [msg.to], reply_to: msg.replyTo || undefined, subject: msg.subject, html: msg.html, headers: { 'List-Unsubscribe': `<${msg.unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } }) })
    if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`)
  } else throw new Error(`Unknown provider ${provider}`)
}

async function send(req: Request) {
  // Only signed-in admins may send.
  const auth = req.headers.get('authorization') ?? ''
  const userDb = createClient(URL_, ANON, { global: { headers: { authorization: auth } }, auth: { persistSession: false } })
  const { data: isAdmin } = await userDb.rpc('bde_is_admin')
  if (!isAdmin) return Response.json({ error: 'Not allowed' }, { status: 403, headers: cors })
  const { campaignId, testEmail } = await req.json()
  return await runCampaign(campaignId, testEmail)
}

async function runCampaign(campaignId: number, testEmail?: string) {
  const { data: settings } = await db.from('bde_settings').select('value').eq('key', 'email').single()
  const s = settings!.value as Record<string, any>
  if (!s.connected || !s.from_email) return Response.json({ error: 'Email sending is not connected yet. Finish Settings → Email first.' }, { status: 400, headers: cors })
  const { data: camp } = await db.from('bde_campaigns').select('*').eq('id', campaignId).single()
  if (!camp) return Response.json({ error: 'Campaign not found' }, { status: 404, headers: cors })

  if (testEmail) {
    let { data: tc } = await db.from('bde_contacts').select('*').eq('email', String(testEmail).toLowerCase()).maybeSingle()
    if (!tc) tc = (await db.from('bde_contacts').insert({ email: String(testEmail).toLowerCase(), name: 'Test', source: 'test', tags: ['test'] }).select().single()).data
    const { data: snd } = await db.from('bde_sends').upsert({ campaign_id: camp.id, contact_id: tc.id, status: 'queued' }, { onConflict: 'campaign_id,contact_id' }).select().single()
    const r = await render(camp.body_html, tc, snd.id, camp.id, s.physical_address)
    await deliver(s.provider, { from: s.from_email, fromName: camp.from_name || s.from_name, replyTo: s.reply_to, to: tc.email, subject: '[TEST] ' + r.subjectFill(camp.subject), html: r.html, unsub: r.unsub })
    await db.from('bde_sends').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', snd.id)
    return Response.json({ ok: true, test: true }, { headers: cors })
  }

  // Build the queue once from the audience filter.
  const { count: queued } = await db.from('bde_sends').select('id', { count: 'exact', head: true }).eq('campaign_id', camp.id)
  if (!queued) {
    const a = camp.audience ?? {}
    if (a.unopenedOf) {
      const { data: prev } = await db.from('bde_sends').select('contact_id').eq('campaign_id', a.unopenedOf).eq('status', 'sent').eq('open_count', 0).limit(50000)
      const rows0 = (prev ?? []).map((r: { contact_id: number }) => ({ campaign_id: camp.id, contact_id: r.contact_id }))
      for (let i = 0; i < rows0.length; i += 1000) await db.from('bde_sends').upsert(rows0.slice(i, i + 1000), { onConflict: 'campaign_id,contact_id', ignoreDuplicates: true })
    }
    // Cold prospects from the autopilot never get bulk campaigns until they reply.
    let q = db.from('bde_contacts').select('id').eq('status', 'subscribed').or('replied_at.not.is.null,tags.not.cs.{prospect}')
    if (a.tags?.length) q = q.overlaps('tags', a.tags)
    if (a.interests?.length) q = q.overlaps('interests', a.interests)
    if (a.countries?.length) q = q.in('country', a.countries)
    if (a.minScore) q = q.gte('score', a.minScore)
    const { data: ids } = a.unopenedOf ? { data: [] } : await q.limit(50000)
    const rows = (ids ?? []).map((r: { id: number }) => ({ campaign_id: camp.id, contact_id: r.id }))
    for (let i = 0; i < rows.length; i += 1000) await db.from('bde_sends').upsert(rows.slice(i, i + 1000), { onConflict: 'campaign_id,contact_id', ignoreDuplicates: true })
  }

  // Respect the provider's daily limit.
  const since = new Date(); since.setUTCHours(0, 0, 0, 0)
  const { count: today } = await db.from('bde_sends').select('id', { count: 'exact', head: true }).eq('status', 'sent').gte('sent_at', since.toISOString())
  const room = Math.max(0, Number(s.daily_limit || 300) - (today ?? 0))
  const batch = Math.min(room, 80) // keep each call short; the panel calls again until done
  const { data: todo } = await db.from('bde_sends').select('id, contact_id, bde_contacts(*)').eq('campaign_id', camp.id).eq('status', 'queued').limit(batch)
  await db.from('bde_campaigns').update({ status: 'sending' }).eq('id', camp.id)
  let sent = 0, failed = 0
  for (const row of todo ?? []) {
    const c = (row as any).bde_contacts
    if (!c || c.status !== 'subscribed') { await db.from('bde_sends').update({ status: 'failed', error: 'not subscribed' }).eq('id', row.id); continue }
    try {
      const r = await render(camp.body_html, c, row.id, camp.id, s.physical_address)
      await deliver(s.provider, { from: s.from_email, fromName: camp.from_name || s.from_name, replyTo: s.reply_to, to: c.email, subject: r.subjectFill(camp.subject), html: r.html, unsub: r.unsub })
      await db.from('bde_sends').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', row.id); sent++
    } catch (e) {
      await db.from('bde_sends').update({ status: 'failed', error: String(e).slice(0, 300) }).eq('id', row.id); failed++
    }
  }
  const { count: left } = await db.from('bde_sends').select('id', { count: 'exact', head: true }).eq('campaign_id', camp.id).eq('status', 'queued')
  if (!left) await db.from('bde_campaigns').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', camp.id)
  return Response.json({ ok: true, sent, failed, remaining: left ?? 0, dailyRoomLeft: Math.max(0, room - sent) }, { headers: cors })
}

let cronTok: string | null = Deno.env.get('BDE_CRON_TOKEN') ?? null
const cronOk = async (req: Request) => {
  if (!cronTok) { const { data } = await db.from('bde_secrets').select('value').eq('key', 'cron_token').maybeSingle(); cronTok = data?.value ?? null }
  const h = req.headers.get('x-bde-cron') ?? ''
  return !!cronTok && cronTok.length >= 20 && h === cronTok
}

async function settingsOf(key: string) { return ((await db.from('bde_settings').select('value').eq('key', key).maybeSingle()).data?.value ?? {}) as Record<string, any> }

/** Hourly: continue campaigns that hit the daily limit, and start scheduled ones. */
async function tick() {
  const auto = await settingsOf('automations')
  const out: unknown[] = []
  if (auto.auto_continue === false) return { skipped: true }
  const { data: due } = await db.from('bde_campaigns').select('id, status, scheduled_at').or(`status.eq.sending,and(status.eq.scheduled,scheduled_at.lte.${new Date().toISOString()})`).limit(5)
  for (const c of due ?? []) { const r = await runCampaign(c.id); out.push({ id: c.id, ...(await r.json()) }) }
  return { ran: out }
}

/** New quote request: instant confirmation to the buyer and an alert to the team. */
async function leadAlert(leadId: number) {
  const s = await settingsOf('email'); const auto = await settingsOf('automations'); const alerts = await settingsOf('alerts')
  if (!s.connected || !s.from_email) return { skipped: 'email not connected' }
  const { data: l } = await db.from('bde_leads').select('*').eq('id', leadId).single()
  if (!l) return { skipped: 'no lead' }
  const items = (l.items ?? []).map((i: any) => `<li>${String(i.style).replace(/[<>&]/g, '')}${i.qty ? ` — ${String(i.qty).replace(/[<>&]/g, '')}` : ''}</li>`).join('')
  const done: string[] = []
  if (auto.auto_reply !== false && l.kind !== 'email_reply') {
    const first = String(l.name ?? '').split(' ')[0].replace(/[<>&]/g, '') || 'there'
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#14211d;max-width:560px"><p>Hello ${first},</p><p>Thank you for your request to BengalExport. Your reference is <b>${l.reference}</b>. A member of our sales team will reply within 24 hours with your price delivered to ${String(l.port || l.country).replace(/[<>&]/g, '')}, or with a few questions if we need details.</p>${items ? `<p>Products in your request:</p><ul>${items}</ul>` : ''}<p>Need samples first? Paid samples of ready styles ship within 24 hours. You can also reach us on WhatsApp: +880 1805-070650.</p><p>Kind regards,<br>BengalExport sales team<br>${s.physical_address ?? ''}</p></div>`
    await deliver(s.provider, { from: s.from_email, fromName: s.from_name || 'BengalExport', replyTo: s.reply_to, to: l.email, subject: `We received your request ${l.reference}`, html, unsub: `${FN}/u` })
    await db.from('bde_activity').insert({ entity: 'lead', entity_id: l.id, actor: 'automation', kind: 'auto', body: 'Instant confirmation email sent to the buyer' })
    done.push('auto_reply')
  }
  if (auto.lead_alert !== false && alerts.new_lead_email) {
    const html = `<div style="font-family:Arial,sans-serif;font-size:14px"><h2 style="margin:0 0 8px">New quote request ${l.reference}</h2><p><b>${String(l.company).replace(/[<>&]/g, '')}</b> · ${String(l.name).replace(/[<>&]/g, '')} · ${String(l.country).replace(/[<>&]/g, '')}${l.port ? `, ${String(l.port).replace(/[<>&]/g, '')}` : ''}<br>${l.email}${l.phone ? ` · ${l.phone}` : ''}</p><ul>${items}</ul><p>${String(l.requirement ?? '').replace(/[<>&]/g, '')}</p><p><a href="${SITE}admin#leads">Open in the admin panel</a></p></div>`
    await deliver(s.provider, { from: s.from_email, fromName: 'BengalExport alerts', to: alerts.new_lead_email, subject: `New quote: ${l.company !== '-' ? l.company : l.name}, ${l.country}`, html, unsub: `${FN}/u` })
    done.push('alert')
  }
  return { done }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const url = new URL(req.url)
  const route = url.pathname.split('/').pop()
  const s = url.searchParams.get('s')
  try {
    if (route === 'o') {
      if (isUuid(s)) await record(s!, 'open', req)
      return new Response(PIXEL, { headers: { 'content-type': 'image/gif', 'cache-control': 'no-store, max-age=0' } })
    }
    if (route === 'c') {
      const u = url.searchParams.get('u') ?? ''
      const ok = isUuid(s) && /^https?:\/\//.test(u) && (await sign(`${s}|${u}`)) === url.searchParams.get('h')
      if (!ok) return Response.redirect(SITE, 302)
      await record(s!, 'click', req, u)
      return Response.redirect(u, 302)
    }
    if (route === 'u') {
      if (!isUuid(s)) return page('Link not valid', '<p>This unsubscribe link is not valid.</p>')
      if (req.method === 'POST' || url.searchParams.get('confirm') === '1') {
        await record(s!, 'unsubscribe', req)
        return page('You are unsubscribed', '<p>You will not receive marketing emails from BengalExport again. If this was a mistake, reply to any of our emails.</p>')
      }
      return page('Unsubscribe from BengalExport emails?', `<form method="post"><button style="background:#0f6b5c;color:#fff;border:0;border-radius:8px;padding:12px 20px;font-size:16px;cursor:pointer">Yes, unsubscribe me</button></form>`)
    }
    if (route === 'send' && req.method === 'POST') return await send(req)
    if (route === 'tick' && req.method === 'POST') return (await cronOk(req)) ? Response.json(await tick()) : new Response('no', { status: 403 })
    if (route === 'lead' && req.method === 'POST') { if (!(await cronOk(req))) return new Response('no', { status: 403 }); const { id } = await req.json(); return Response.json(await leadAlert(Number(id))) }
    return new Response('Not found', { status: 404, headers: cors })
  } catch (e) {
    return Response.json({ error: String(e).slice(0, 300) }, { status: 500, headers: cors })
  }
})
