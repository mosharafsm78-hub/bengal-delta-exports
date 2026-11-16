import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

/** Browser-only Supabase client for the admin panel. Data access is limited by row-level security to listed admins. */
export function sb() {
  if (!client) {
    client = createClient(import.meta.env.VITE_SUPABASE_URL as string, import.meta.env.VITE_SUPABASE_KEY as string, {
      auth: { persistSession: true, storageKey: 'bde-admin-auth', autoRefreshToken: true },
    })
  }
  return client
}

export const FN_URL = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/bde-mail`

export const LEAD_STAGES = ['New request', 'Contacted', 'Offer sent', 'Samples', 'LC opened', 'In production', 'Shipped', 'Won', 'Lost'] as const
export const SUPPLIER_STAGES = [
  ['applied', 'Applied'],
  ['documents', 'Documents check'],
  ['visit', 'Factory visit'],
  ['sample', 'Sample approved'],
  ['approved', 'Approved'],
  ['rejected', 'Rejected'],
] as const
export const SUPPLIER_CHECKS = [
  ['trade_licence', 'Trade licence checked'],
  ['erc', 'ERC / export registration checked'],
  ['tin_bin', 'TIN and BIN checked'],
  ['bank', 'Bank account verified'],
  ['visit', 'Factory visited (photos saved)'],
  ['capacity', 'Capacity and lead time confirmed'],
  ['sample', 'Sample quality approved'],
  ['compliance', 'Compliance / certificates seen'],
] as const

export type Lead = Record<string, any> & { id: number; created_at: string; stage: string; name: string; email: string; country: string; company: string }
export type Supplier = Record<string, any> & { id: number; stage: string; company: string; checklist: Record<string, boolean> }
export type Contact = Record<string, any> & { id: number; email: string; status: string; score: number; tags: string[]; interests: string[] }
export type Campaign = Record<string, any> & { id: number; name: string; subject: string; status: string; body_html: string; audience: Record<string, any> }
export type WebEvent = { id: number; created_at: string; visitor_id: string; session_id: string | null; contact_id: number | null; campaign_id: number | null; kind: string; path: string | null; label: string | null; product: string | null; category: string | null; referrer: string | null; utm_source: string | null; utm_campaign: string | null; device: string | null; lang: string | null; tz: string | null }

export const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString()
export const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
export const fmtTime = (s?: string | null) => (s ? new Date(s).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—')
export const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 1000) / 10}%` : '—')
export const ago = (s?: string | null) => {
  if (!s) return '—'
  const m = Math.round((Date.now() - new Date(s).getTime()) / 6e4)
  if (m < 60) return `${m} min ago`
  if (m < 1440) return `${Math.round(m / 60)} h ago`
  return `${Math.round(m / 1440)} d ago`
}

/** Fetch rows in pages so large tables are complete. */
export async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: any[] | null; error: unknown }>, max = 20000) {
  const out: T[] = []
  for (let from = 0; from < max; from += 1000) {
    const { data, error } = await build(from, from + 999)
    if (error) throw error
    out.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return out
}

export function countBy<T>(rows: T[], key: (r: T) => string | null | undefined) {
  const m = new Map<string, number>()
  for (const r of rows) { const k = key(r); if (k) m.set(k, (m.get(k) ?? 0) + 1) }
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

/** Rough country from the browser's time zone (no IP lookup). */
export function tzCountry(tz?: string | null) {
  if (!tz) return null
  const map: Record<string, string> = {
    'Asia/Dhaka': 'Bangladesh', 'Asia/Kolkata': 'India', 'Asia/Calcutta': 'India', 'Asia/Dubai': 'UAE', 'Asia/Riyadh': 'Saudi Arabia', 'Asia/Qatar': 'Qatar', 'Asia/Kuwait': 'Kuwait',
    'Europe/London': 'United Kingdom', 'Europe/Berlin': 'Germany', 'Europe/Paris': 'France', 'Europe/Madrid': 'Spain', 'Europe/Rome': 'Italy', 'Europe/Amsterdam': 'Netherlands', 'Europe/Brussels': 'Belgium', 'Europe/Stockholm': 'Sweden', 'Europe/Warsaw': 'Poland',
    'America/New_York': 'USA', 'America/Chicago': 'USA', 'America/Denver': 'USA', 'America/Los_Angeles': 'USA', 'America/Toronto': 'Canada', 'America/Vancouver': 'Canada',
    'Australia/Sydney': 'Australia', 'Australia/Melbourne': 'Australia', 'Asia/Tokyo': 'Japan', 'Asia/Seoul': 'South Korea', 'Asia/Shanghai': 'China', 'Asia/Singapore': 'Singapore', 'Asia/Kuala_Lumpur': 'Malaysia',
  }
  return map[tz] ?? tz.split('/')[0]
}
