import { SITE } from '@/data/site'

export interface LeadPayload {
  reference?: string
  kind: 'quote' | 'requirement' | 'question'
  items: { family: string; style: string; qty?: string; spec?: string; estimate?: string }[]
  requirement?: string
  quantity: string
  unit?: string
  country: string
  port?: string
  incoterm?: string
  neededBy?: string
  certificates: string[]
  company: string
  buyerType?: string
  name: string
  email: string
  phone?: string
  website?: string
  notes?: string
  sourcePage?: string
  consent: boolean
}

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY = import.meta.env.VITE_SUPABASE_KEY as string | undefined

export const leadsOnline = Boolean(URL_ && KEY)

/** Plain-text version of a lead, used for email and WhatsApp fallbacks. */
export function leadText(p: LeadPayload) {
  const lines = [
    `New ${p.kind} request — ${SITE.name}`,
    '',
    ...(p.items.length ? ['Products:', ...p.items.map((i) => `- ${i.style} (${i.family})${i.qty ? `, qty ${i.qty}` : ''}${i.spec ? ` — ${i.spec}` : ''}${i.estimate ? ` [est. ${i.estimate}]` : ''}`), ''] : []),
    p.requirement ? `Requirement: ${p.requirement}\n` : '',
    `Total quantity: ${p.quantity} ${p.unit ?? ''}`,
    `Destination: ${p.country}${p.port ? `, ${p.port}` : ''} · ${p.incoterm ?? ''}`,
    p.neededBy ? `Needed by: ${p.neededBy}` : '',
    p.certificates.length ? `Certificates: ${p.certificates.join(', ')}` : '',
    '',
    `${p.name} · ${p.company}${p.buyerType ? ` (${p.buyerType})` : ''}`,
    `${p.email}${p.phone ? ` · ${p.phone}` : ''}${p.website ? ` · ${p.website}` : ''}`,
    p.notes ? `\nNotes: ${p.notes}` : '',
  ]
  return lines.filter((l) => l !== '').join('\n')
}

export function mailtoFor(p: LeadPayload) {
  const subject = `${p.kind === 'quote' ? 'Quote request' : p.kind === 'question' ? 'Question' : 'Sourcing requirement'} — ${p.company}, ${p.country}`
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(leadText(p))}`
}

export function whatsappLink(text: string) {
  return SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}` : ''
}

/** Saves the lead. Returns 'saved' when stored online, or 'email' when the buyer's email app must send it. */
export async function submitLead(p: LeadPayload): Promise<'saved' | 'email'> {
  if (!leadsOnline) {
    window.location.href = mailtoFor(p)
    return 'email'
  }
  const res = await fetch(`${URL_}/rest/v1/rpc/bde_submit_lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY!, Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ p }),
  })
  if (!res.ok) {
    let msg = 'Something went wrong. Please try again, or email us.'
    try {
      const j = (await res.json()) as { message?: string }
      if (j.message && j.message.length < 120) msg = j.message
    } catch {
      /* keep default */
    }
    throw new Error(msg)
  }
  return 'saved'
}
