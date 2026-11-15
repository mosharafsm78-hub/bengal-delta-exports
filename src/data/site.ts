// Business settings and shared page content. Change contact details here before going live.
export const SITE = {
  name: 'Bengal Delta Exports',
  tagline: 'Sourced in Bangladesh · Shipped worldwide',
  email: 'sales@bengaldeltaexports.com',
  whatsapp: '', // international digits only, e.g. 88018XXXXXXXX — leave empty to hide WhatsApp buttons
  whatsappDisplay: '', // e.g. +880 18XX-XXXXXX
  phone: '', // e.g. +880 18XX-XXXXXX — shown in the footer and About page when filled
  address: '', // full street address of the Chattogram office — shown when filled
  founder: 'Mosharaf Hossain',
  founderRole: 'Founder and Managing Director',
  /** Registration numbers are shown on the About page only when filled in. */
  registration: { erc: '', tradeLicence: '', tin: '', bin: '' },
  hours: 'Sat–Thu, 9:00–19:00 Bangladesh time (GMT+6)',
  offices: ['Chattogram (head office)', 'Dhaka'],
  updated: 'November 2026',
}

/** The buyer's journey from first visit to goods in their warehouse. [title, what happens, typical time, who acts] */
export const STEPS: [string, string, string][] = [
  ['Request a proforma invoice', 'Add products and quantities to your quote, or describe any requirement, and send one request.', 'Day 0'],
  ['Receive the proforma invoice', 'Prices, specifications, packing, Incoterm, latest shipment date and the LC terms we need, in one document.', 'Within 24 h'],
  ['Approve samples', 'Pre-production samples by courier, or photos and video for fresh produce. Sample cost is refunded on your first order.', '3–10 days'],
  ['Open a 100% LC at sight', 'Your bank issues an irrevocable Letter of Credit at sight for the full proforma value. We check it and confirm acceptance.', '3–7 days'],
  ['Production or harvest', 'Starts the day the LC is accepted. You get progress photos and updates at every stage.', 'Per product'],
  ['Inspection and certificates', 'Our final inspection or your third-party inspector, plus the certificates your market requires.', '1–3 days'],
  ['Shipment and documents', 'We ship before the LC\'s latest shipment date and present the shipping documents through our bank.', '1–3 days'],
  ['Bank payment and delivery', 'Your bank pays against compliant documents and releases them to you to clear the goods at your port.', '5–10 banking days'],
]

export const PAYMENT_HEADLINE = '100% irrevocable Letter of Credit (LC) at sight'

export const PAYMENT_TERMS: [string, string][] = [
  ['All orders', '100% irrevocable documentary Letter of Credit at sight, issued by your bank under UCP 600. Production or harvest starts once we receive and accept the LC.'],
  ['Why we use LC', 'It protects both sides. Your bank pays only when our bank presents shipping documents that match the LC, which proves the goods were shipped as agreed.'],
  ['Confirmed LC', 'For some issuing banks or countries we may ask for the LC to be confirmed by a first-class international bank. We tell you on the proforma invoice.'],
  ['Samples', 'Sample cost and courier are quoted separately and credited against your first LC order.'],
  ['Bank charges', 'Standard practice: charges at your bank are for your account, charges in Bangladesh are for ours.'],
]

/** What the LC should say. The exact beneficiary and bank details are printed on the proforma invoice. */
export const LC_TERMS: [string, string][] = [
  ['Form of credit', 'Irrevocable documentary credit, available at sight'],
  ['Rules', 'UCP 600 (latest version)'],
  ['Beneficiary', 'Our company name and address exactly as on the proforma invoice'],
  ['Advising bank', 'Our bank in Bangladesh, with the SWIFT code shown on the proforma invoice'],
  ['Amount', '100% of the proforma value (±5% tolerance for fresh produce and bulk goods)'],
  ['Incoterm and port', 'As on the proforma: FOB Chattogram / Dhaka, CFR or CIF to your port'],
  ['Latest shipment date', 'Order date plus the production lead time on the proforma'],
  ['Expiry', '21 days after the latest shipment date, in Bangladesh'],
  ['Partial shipment / transshipment', 'Allowed'],
  ['Presentation period', 'Within 21 days after the shipment date'],
]

export const LC_DOCS = [
  'Signed commercial invoice',
  'Packing list',
  'Full set of clean on-board Bill of Lading, or Air Waybill',
  'Certificate of Origin, or REX statement on origin for duty-free EU / UK entry',
  'Phytosanitary certificate (plants and produce) or health certificate (fish and shrimp)',
  'Inspection certificate, if your LC asks for one',
  'Insurance certificate (CIF orders)',
]

export const DOCUMENTS = [
  'Proforma invoice and sales contract',
  'Commercial invoice and packing list',
  'Bill of Lading (sea) or Air Waybill (air)',
  'Certificate of Origin, or REX statement on origin for duty-free EU and UK entry',
  'Phytosanitary certificate and lab report for plant products',
  'Health certificate (FIQC) for fish and shrimp',
  'Pre-shipment inspection report with photos',
  'Halal, fumigation or other certificates your country requires',
]

export type Status = 'ok' | 'watch' | 'disrupted'

export const DUTY: { market: string; short: string; duty: string; zero: boolean; scheme: string; proof: string; status: Status; statusText: string }[] = [
  { market: 'European Union (27 countries)', short: 'European Union', duty: '0% on 99% of tariff lines (all except arms)', zero: true, scheme: "Everything But Arms (EBA). Continues until Bangladesh leaves LDC status on 24 Nov 2029, then the EU's 3-year transition. Afterwards apparel would face about 12%.", proof: 'REX statement on origin', status: 'ok', statusText: 'Normal' },
  { market: 'United Kingdom', short: 'United Kingdom', duty: '0% on all goods except arms', zero: true, scheme: 'DCTS Comprehensive Preferences. After 2029 Bangladesh moves to Enhanced Preferences, still duty-free on about 98% of lines, with relaxed apparel origin rules.', proof: 'Statement on origin', status: 'ok', statusText: 'Normal' },
  { market: 'Canada', short: 'Canada', duty: '0% on 98.6% of lines (not dairy, eggs, poultry)', zero: true, scheme: "LDC Tariff now; Canada's developing-country scheme keeps duty-free access until 2034.", proof: 'Certificate / statement of origin', status: 'ok', statusText: 'Normal' },
  { market: 'Australia', short: 'Australia', duty: '0% on 100% of lines', zero: true, scheme: 'LDC preference, extended to at least 2034.', proof: 'Origin declaration', status: 'ok', statusText: 'Normal' },
  { market: 'China', short: 'China', duty: '0% on 100% of lines (quota goods within quota)', zero: true, scheme: "China's zero-tariff treatment for LDCs, in force since 1 Dec 2024. About 9 days by sea from Chattogram.", proof: 'Certificate of origin', status: 'ok', statusText: 'Normal' },
  { market: 'Japan', short: 'Japan', duty: '0% on most goods', zero: true, scheme: "LDC preference today. The Bangladesh–Japan EPA signed on 6 Feb 2026 makes 7,379 products (about 97% of Bangladesh's exports, including garments) duty-free permanently once Japan ratifies it.", proof: 'Certificate of origin', status: 'ok', statusText: 'Normal' },
  { market: 'South Korea', short: 'South Korea', duty: '0% on most products', zero: true, scheme: "Korea's preferential tariff for LDCs covers most products; some farm and fishery lines are excluded, so we confirm your HS code on the proforma.", proof: 'Certificate of origin', status: 'ok', statusText: 'Normal' },
  { market: 'India', short: 'India', duty: '0% on most lines', zero: true, scheme: 'SAFTA. Since May 2025 India allows Bangladeshi garments only through Kolkata and Nhava Sheva seaports, and jute products only through Nhava Sheva; fruit, processed food and some other goods cannot enter by land.', proof: 'SAFTA certificate of origin', status: 'watch', statusText: 'Sea only for many goods' },
  { market: 'Gulf states (Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman)', short: 'Gulf states', duty: '0% fresh vegetables and fruit · 5% most other goods', zero: false, scheme: 'GCC common external tariff on CIF value. Saudi Arabia raised some food lines to 5–15% in July 2026. VAT is separate (UAE 5%, Saudi 15%).', proof: 'Certificate of origin, legalised where required', status: 'disrupted', statusText: 'Saudi normal by air; others disrupted' },
  { market: 'Singapore', short: 'Singapore', duty: '0% on almost all goods', zero: true, scheme: 'Duty applies only to alcohol, tobacco, motor vehicles and petroleum. GST applies.', proof: 'Commercial documents', status: 'ok', statusText: 'Normal' },
  { market: 'USA', short: 'USA', duty: '19% reciprocal tariff + normal duty', zero: false, scheme: 'US–Bangladesh reciprocal trade agreement of 9 Feb 2026 set the extra tariff at 19%. Garments made with US cotton or US man-made fibre qualify for a 0% reciprocal rate; ask us for US-cotton options.', proof: 'Certificate of origin, US-input records for the 0% route', status: 'ok', statusText: 'Normal' },
  { market: 'Also preferential', short: 'Norway, Switzerland, NZ, Turkey and others', duty: 'Full or partial duty-free', zero: true, scheme: 'Norway, Switzerland, New Zealand, Turkey, Russia and Chile run GSP or LDC schemes.', proof: 'Certificate of origin', status: 'ok', statusText: 'Normal' },
]

/** Landed-cost calculator presets: [market, duty % on goods, duty % on fresh produce] (null = enter your own) */
export const DUTY_PRESETS: [string, number | null, number | null][] = [
  ['European Union', 0, 0], ['United Kingdom', 0, 0], ['Canada', 0, 0], ['Australia', 0, 0], ['China', 0, 0], ['Japan', 0, 0], ['South Korea', 0, 0], ['India', 0, 0],
  ['Saudi Arabia', 5, 0], ['UAE', 5, 0], ['Qatar / Kuwait / Bahrain / Oman', 5, 0], ['Singapore', 0, 0], ['USA (19% + your MFN rate)', 19, 19], ['Other', null, null],
]

export const SHIP_MODES = [
  ['Sea, 20/40 ft dry container', 'Chattogram', 'Garments, footwear, jute, home textiles, packed food', '7–45 days', 'FCL, or LCL consolidation from 1 CBM'],
  ['Sea, reefer container', 'Chattogram', 'Potato, cabbage, cauliflower, carrot, mango, frozen food', '7–30 days', 'Temperature set by product, −18 °C to +13 °C'],
  ['Air cargo', 'Dhaka (DAC)', 'Gourds, leafy greens, chilies, betel leaf, fruit, urgent garments', '1–4 days', 'Space booked 3–7 days ahead; rate quoted per kg'],
  ['Land', 'Banglabandha, Benapole', 'Potato and bulk goods', '2–6 days', 'Nepal, Bhutan; India for permitted goods'],
  ['Express courier', 'Dhaka', 'Samples, swatches', '3–6 days', 'Door to door'],
]

export const TRANSIT: [string, string, string, Status, string][] = [
  ['Malaysia', 'Port Klang', '7–12', 'ok', 'Normal'],
  ['Singapore', 'Singapore', '7–12', 'ok', 'Normal'],
  ['Sri Lanka', 'Colombo', '5–9', 'ok', 'Normal'],
  ['China', 'Shanghai, Shenzhen', '9–18', 'ok', 'Normal'],
  ['Japan', 'Tokyo, Yokohama', '18–25', 'ok', 'Normal'],
  ['Saudi Arabia (Red Sea)', 'Jeddah', '15–22', 'watch', 'Watch Red Sea'],
  ['UAE, Qatar, Kuwait', 'Jebel Ali, Hamad, Shuwaikh', 'Confirmed at booking', 'disrupted', 'Disrupted'],
  ['United Kingdom', 'Felixstowe', '32–42', 'ok', 'Normal'],
  ['Northern Europe', 'Hamburg, Rotterdam, Antwerp', '32–42', 'ok', 'Normal'],
  ['USA East Coast', 'New York / New Jersey', '35–45', 'ok', 'Normal'],
  ['USA West Coast', 'Los Angeles', '28–38', 'ok', 'Normal'],
  ['Canada', 'Vancouver, Montreal', '30–45', 'ok', 'Normal'],
  ['Australia', 'Sydney, Melbourne', '20–30', 'ok', 'Normal'],
]

export const INCOTERMS = [
  ['FOB', 'We deliver loaded on board at Chattogram or Dhaka. You book the freight. Our default price basis.'],
  ['CFR / CNF', 'We pay freight to your port. You insure and clear customs.'],
  ['CIF', 'Freight and marine insurance to your port included.'],
  ['DAP / DDP', 'Delivered to your door, on request for repeat buyers in the EU, UK and US.'],
]

export const ADVISORY = 'Gulf air and sea routes through the Strait of Hormuz remain disrupted (Nov 2026). Europe, UK, USA, East Asia, Malaysia, Singapore and Saudi Arabia ship normally via alternative routings.'

export const FAQ: [string, string][] = [
  ['What is your minimum order?', 'It depends on the product: garments 300–1,000 pieces per style, footwear 300–600 pairs per design, fresh produce from 300–500 kg by air or one reefer by sea. Each product page shows its minimum. You can mix several products in one container.'],
  ['Are the prices on the site final?', 'No. They are indicative FOB ranges, updated November 2026. Your proforma invoice confirms the exact price for your quantity, specifications and delivery date.'],
  ['How do I pay?', 'Every order is paid by a 100% irrevocable Letter of Credit (LC) at sight, issued by your bank under UCP 600. Your bank pays only against shipping documents that match the LC, so your money is protected until the goods are shipped as agreed.'],
  ['How do I open an LC?', 'Accept our proforma invoice, then give it to your bank and ask for an irrevocable LC at sight for the full amount. Our How to order page lists exactly what the LC should say. Most banks issue it in 2–5 working days.'],
  ['Can I pay by bank transfer (T/T) instead?', 'For orders we work only on 100% LC at sight, because it protects both sides. Small sample charges can be settled separately.'],
  ['Can you make products under my brand?', 'Yes. Garments, footwear, bags, food and home textiles can carry your labels, hang tags, packaging and logos.'],
  ['Can I order a ready style instead of a custom design?', 'Yes. Every product page lists the standard types we make. Pick one and we quote it as is, or change the fabric, colour or branding with the price calculator.'],
  ['Where do Bangladeshi goods enter duty-free?', 'The EU, UK, Canada, Australia and China charge 0% on practically everything; Japan, South Korea and India on most goods. The Gulf charges 5% (0% on fresh produce) and the USA a 19% reciprocal tariff plus normal duty.'],
  ['Can you ship to the Gulf right now?', 'Yes for Saudi Arabia by air and via Jeddah. For the UAE, Qatar, Kuwait, Bahrain and Oman, routes are disrupted by the regional conflict; we confirm dates only at booking.'],
  ['How do I know fresh produce is safe?', 'Every lot is residue-tested before shipment, and the Bangladesh Plant Quarantine Wing issues a phytosanitary certificate only for lots that pass.'],
  ['Can I visit the factories or send an inspector?', 'Yes. Our footwear factories and partner mills welcome buyer visits and third-party audits such as SGS, Intertek and Bureau Veritas.'],
  ['What cannot be exported from Bangladesh?', 'Onion, garlic, ginger, non-aromatic rice, raw pulses, most crop seeds and some shrimp sizes are banned for export under the Export Policy 2024-27.'],
]
