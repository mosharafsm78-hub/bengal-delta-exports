import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

/** Browser-only Supabase client for buyer accounts (separate session from the admin panel). */
export function bsb() {
  client ??= createClient(import.meta.env.VITE_SUPABASE_URL as string, import.meta.env.VITE_SUPABASE_KEY as string, {
    auth: { persistSession: true, storageKey: 'bde-buyer-auth', autoRefreshToken: true },
  })
  return client
}

/** Call the Buyer Desk service. */
export async function desk<T = any>(route: string, body: Record<string, unknown> = {}, signedIn = true): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_KEY as string }
  if (signedIn) {
    const { data } = await bsb().auth.getSession()
    if (data.session) headers.authorization = `Bearer ${data.session.access_token}`
  }
  const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/bde-buyer/${route}`, { method: 'POST', headers, body: JSON.stringify(body) })
  const j = await r.json().catch(() => ({ error: 'The service did not respond. Please try again.' }))
  if (!r.ok || j.error) throw new Error(j.error ?? 'Request failed')
  return j as T
}

export type Buyer = {
  user_id: string; email: string; name: string; company: string; country: string; website: string | null; phone: string | null
  buyer_type: string | null; yearly_volume: string | null; interests: string[]; company_number: string | null
  email_verified: boolean; status: 'new' | 'review' | 'verified' | 'trusted' | 'rejected'; checks: Record<string, boolean>; agent_id: number | null; created_at: string
}
export type Agent = { id: number; name: string; title: string | null; email: string | null; whatsapp: string | null; languages: string | null; bio: string | null }
export type Msg = { id: number; created_at: string; sender: 'buyer' | 'ai' | 'agent' | 'system'; agent_name: string | null; body: string; lead_id: number | null }
export type Req = { id: number; created_at: string; reference: string | null; items: { style: string; qty?: string }[] | null; requirement: string | null; quantity: string | null; unit: string | null; port: string | null; stage: string | null }

export const STAGES = ['New request', 'Contacted', 'Offer sent', 'Samples', 'LC opened', 'In production', 'Shipped', 'Won'] as const
