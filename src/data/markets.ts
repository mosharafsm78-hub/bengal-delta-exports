import { DUTY, TRANSIT } from './site'
import type { CategoryId } from './types'

/** Buyer markets with their own landing pages: /export-to/{id}/ and /export-to/{id}/{familyId}/ */
export interface Market {
  id: string
  name: string
  /** "the UK", "Germany": used inside sentences */
  inText: string
  buyer: string
  duty: string
  transit: string
  ports: string
  /** Product categories with a sensible trade lane to this market */
  cats: CategoryId[]
}

const ALL: CategoryId[] = ['garments', 'footwear', 'home', 'jute', 'produce', 'food', 'crafts']
const NO_FRESH: CategoryId[] = ['garments', 'footwear', 'home', 'jute', 'food', 'crafts']
const dutyOf = (short: string) => DUTY.find((d) => d.short === short)!
const transitOf = (name: string) => TRANSIT.find((t) => t[0] === name)!

function m(id: string, name: string, inText: string, buyer: string, dutyShort: string, transitName: string, cats: CategoryId[]): Market {
  const t = transitOf(transitName)
  return { id, name, inText, buyer, duty: dutyShort, transit: `${t[2]} days by sea`, ports: t[1], cats }
}

export const MARKETS: Market[] = [
  m('united-kingdom', 'United Kingdom', 'the UK', 'UK', 'United Kingdom', 'United Kingdom', ALL),
  m('germany', 'Germany', 'Germany', 'German', 'European Union', 'Northern Europe', NO_FRESH),
  m('netherlands', 'Netherlands', 'the Netherlands', 'Dutch', 'European Union', 'Northern Europe', ALL),
  m('france', 'France', 'France', 'French', 'European Union', 'Northern Europe', NO_FRESH),
  m('spain', 'Spain', 'Spain', 'Spanish', 'European Union', 'Northern Europe', NO_FRESH),
  m('italy', 'Italy', 'Italy', 'Italian', 'European Union', 'Northern Europe', ALL),
  m('poland', 'Poland', 'Poland', 'Polish', 'European Union', 'Northern Europe', NO_FRESH),
  m('belgium', 'Belgium', 'Belgium', 'Belgian', 'European Union', 'Northern Europe', NO_FRESH),
  m('usa', 'United States', 'the USA', 'US', 'USA', 'USA East Coast', NO_FRESH),
  m('canada', 'Canada', 'Canada', 'Canadian', 'Canada', 'Canada', NO_FRESH),
  m('australia', 'Australia', 'Australia', 'Australian', 'Australia', 'Australia', NO_FRESH),
  m('japan', 'Japan', 'Japan', 'Japanese', 'Japan', 'Japan', NO_FRESH),
  m('singapore', 'Singapore', 'Singapore', 'Singapore', 'Singapore', 'Singapore', ALL),
  m('saudi-arabia', 'Saudi Arabia', 'Saudi Arabia', 'Saudi', 'Gulf states', 'Saudi Arabia (Red Sea)', ALL),
]
// EU members share one duty row; give them their own port names.
const EU_PORTS: Record<string, string> = { germany: 'Hamburg, Bremerhaven', netherlands: 'Rotterdam', france: 'Le Havre, Marseille', spain: 'Valencia, Barcelona', italy: 'Genoa, La Spezia', poland: 'Gdańsk', belgium: 'Antwerp' }
for (const k of MARKETS) if (EU_PORTS[k.id]) k.ports = EU_PORTS[k.id]

export const marketById = (id: string) => MARKETS.find((k) => k.id === id)
export const marketDuty = (k: Market) => dutyOf(k.duty)

/** One honest sentence on what the buyer pays at the border, by market and category. */
export function dutyLine(k: Market, cat: CategoryId) {
  const d = marketDuty(k)
  if (k.id === 'saudi-arabia') return cat === 'produce' ? 'Fresh vegetables and fruit from Bangladesh enter Saudi Arabia at 0% duty; 15% VAT is separate.' : 'Most goods pay the GCC 5% duty on the CIF value; some food lines are 5–15% since July 2026. 15% VAT is separate.'
  if (k.id === 'usa') return 'Imports from Bangladesh pay the 19% reciprocal tariff plus the normal US duty for the HS code. Garments made with US cotton or US man-made fibre can qualify for a 0% reciprocal rate.'
  if (k.duty === 'European Union') return `Goods from Bangladesh enter ${k.inText} at 0% import duty under the EU's Everything But Arms scheme, with a REX statement on origin that we provide. VAT is separate and usually reclaimed by businesses.`
  return `${d.duty}. ${d.scheme.split('. ')[0]}. We supply the ${d.proof.toLowerCase()} needed for the preferential rate.`
}
