// Starter email templates. Product images sit in a row with the text below each image.
const SITE = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/?$/, '/') ?? 'https://mosharafsm78-hub.github.io/bengal-delta-exports/'
const img = (k: string) => `${SITE}email/${k}.jpg`

type P = { key: string; title: string; line: string; url: string }

const wrap = (inner: string) => `<div style="background:#f4f3ef;padding:24px 0;font-family:Arial,Helvetica,sans-serif;color:#14211d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#0f6b5c;padding:18px 28px;color:#ffffff;font-size:20px;font-weight:bold">BengalExport<span style="display:block;font-size:12px;font-weight:normal;opacity:.85">Bangladesh export hub · Chattogram</span></td></tr>
<tr><td style="padding:28px">${inner}</td></tr>
<tr><td style="background:#f8f7f3;padding:16px 28px;font-size:13px;color:#4b5852">100% LC at sight · Inspected before shipment · Paid samples ship in 24 hours<br>WhatsApp +880 1805-070650</td></tr>
</table></div>`

const row = (ps: P[]) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${ps.map((p) => `<td width="${Math.floor(100 / ps.length)}%" valign="top" style="padding:0 6px">
<a href="${p.url}" style="text-decoration:none;color:#14211d"><img src="${img(p.key)}" width="100%" alt="${p.title}" style="display:block;width:100%;border-radius:8px;border:0">
<p style="margin:10px 0 2px;font-size:15px;font-weight:bold">${p.title}</p><p style="margin:0;font-size:13px;color:#4b5852">${p.line}</p></a></td>`).join('')}</tr></table>`

const button = (label: string, url: string) => `<p style="margin:26px 0 0"><a href="${url}" style="display:inline-block;background:#0f6b5c;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 22px;border-radius:8px">${label}</a></p>`

export const TEMPLATES: { id: string; name: string; subject: string; html: string }[] = [
  {
    id: 'intro',
    name: 'Introduction to new buyers',
    subject: '{{company}}: direct supply from Bangladesh, delivered to your port',
    html: wrap(`<p style="margin:0 0 14px;font-size:16px">Hello {{first_name}},</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6">I'm writing from BengalExport in Chattogram. We supply garments, footwear, home textiles, jute and fresh produce from verified Bangladeshi producers, with prices delivered to your port and payment by 100% LC at sight, so your money stays protected until the goods ship.</p>
${row([
  { key: 'tshirt-crew', title: 'Garments', line: 'T-shirts, polos, denim', url: `${SITE}products/tshirts/` },
  { key: 'bath-towels', title: 'Home textiles', line: 'Towels and bedding', url: `${SITE}products/towels/` },
  { key: 'jute-tote', title: 'Jute', line: 'Bags, rugs, sacks', url: `${SITE}products/jute-bags/` },
])}
<p style="margin:22px 0 0;font-size:15px;line-height:1.6">Most products enter the EU, UK, Canada, Australia and China duty-free. Paid samples leave within 24 hours.</p>
${button('See prices and order online', `${SITE}products`)}`),
  },
  {
    id: 'garments',
    name: 'Garments offer',
    subject: '{{company}}: Bangladesh T-shirts, polos and hoodies, priced to your port',
    html: wrap(`<p style="margin:0 0 14px;font-size:16px">Hello {{first_name}},</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6">Planning your next garment program? Here are three of our most requested lines. Every price on our site is calculated live for your quantity, and your offer includes freight and insurance to your port.</p>
${row([
  { key: 'tshirt-crew', title: 'Crew-neck T-shirts', line: '160–220 gsm cotton', url: `${SITE}products/tshirts/` },
  { key: 'polo-classic', title: 'Pique polos', line: 'Corporate and retail', url: `${SITE}products/polos/` },
  { key: 'hoodie-pullover', title: 'Fleece hoodies', line: 'Brushed back fleece', url: `${SITE}products/fleece/` },
])}
${button('Get my firm price', `${SITE}quote`)}`),
  },
  {
    id: 'produce',
    name: 'Fresh produce this season',
    subject: 'In season now: fresh vegetables from Bangladesh, by air or reefer',
    html: wrap(`<p style="margin:0 0 14px;font-size:16px">Hello {{first_name}},</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.6">These vegetables are at their best and best-priced right now. Every lot is sorted, graded and shipped with a phytosanitary certificate.</p>
${row([
  { key: 'pointed-gourd', title: 'Pointed gourd', line: 'Air freight weekly', url: `${SITE}products/vegetables/` },
  { key: 'bitter-gourd', title: 'Bitter gourd', line: 'Graded and packed', url: `${SITE}products/vegetables/` },
  { key: 'green-chili', title: 'Green chili', line: 'Fresh, residue tested', url: `${SITE}products/vegetables/` },
])}
${button('See this week’s produce', `${SITE}products/vegetables/`)}`),
  },
  { id: 'blank', name: 'Blank (plain letter)', subject: '', html: wrap(`<p style="margin:0 0 14px;font-size:16px">Hello {{first_name}},</p>\n<p style="margin:0;font-size:15px;line-height:1.6">Write your message here.</p>\n${button('Visit BengalExport', SITE)}`) },
]
