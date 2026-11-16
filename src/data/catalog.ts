// BengalExport catalogue.
// Prices: indicative FOB USD, November 2026. b:"M" = based on published Bangladeshi supplier prices; otherwise our estimate.
import type { Category, Family } from './types'

export const CATS: Category[] = [
  { id: 'garments', name: 'Garments & apparel', short: 'Garments', blurb: 'Knit and woven clothing for men, women and kids, from basic tees to outerwear.' },
  { id: 'footwear', name: 'Footwear & leather', short: 'Footwear', blurb: 'Slides, sandals, sneakers, leather shoes, belts, wallets and bags from verified Bangladeshi factories.' },
  { id: 'home', name: 'Home textiles', short: 'Home textiles', blurb: 'Towels, bed linen, kitchen and table textiles.' },
  { id: 'jute', name: 'Jute & natural fibre', short: 'Jute', blurb: 'Jute bags, sacks, hessian, yarn, rope and jute home decor.' },
  { id: 'produce', name: 'Fresh vegetables & fruit', short: 'Fresh produce', blurb: 'Potato, cabbage, gourds, chilies, leafy greens, mango, jackfruit and more.' },
  { id: 'food', name: 'Food, spices & frozen', short: 'Food', blurb: 'Spices, aromatic rice, tea, oil, snacks, frozen fish, shrimp and ready-to-cook foods.' },
  { id: 'crafts', name: 'Handicrafts & handloom', short: 'Handicrafts', blurb: 'Nakshi kantha, jamdani, seagrass, cane, bamboo and terracotta.' },
]

type Lead = Family['lead']
type Tiers = [string, number][]

const LEAD_KNIT: Lead = [['Sampling and approval', 7, 12], ['Lab dip / colour approval', 5, 7], ['Yarn, knitting, dyeing, finishing', 10, 18], ['Cutting and printing', 3, 7], ['Sewing', 10, 20], ['Finishing, inspection, packing', 4, 7]]
const LEAD_WOVEN: Lead = [['Sampling and approval', 10, 15], ['Lab dip / strike-off', 5, 10], ['Fabric sourcing or weaving', 15, 30], ['Cutting', 3, 6], ['Sewing', 15, 25], ['Washing (if any), finishing, inspection, packing', 5, 10]]
const LEAD_SHOE: Lead = [['Sampling and approval', 10, 15], ['Materials and moulds (new sole)', 7, 20], ['Cutting and stitching uppers', 7, 12], ['Lasting, sole attaching', 7, 12], ['Finishing, inspection, boxing', 3, 5]]
const LEAD_PRODUCE: Lead = [['Order confirmation and LC', 1, 2], ['Harvest from contract farms', 1, 3], ['Sorting, grading, washing, packing', 1, 1], ['Residue test and phytosanitary certificate', 1, 2], ['Cold chain to airport / port', 1, 1]]
const LEAD_FOOD: Lead = [['Specification and label approval', 3, 7], ['Production or procurement', 7, 15], ['Lab test, halal / health certificates', 3, 7], ['Packing and loading', 2, 4]]
const LEAD_JUTE: Lead = [['Sample and approval', 5, 10], ['Fabric weaving or yarn spinning', 7, 15], ['Cutting, printing, stitching', 7, 15], ['Inspection and baling / cartons', 2, 4]]

const QTY_TIERS: Tiers = [['300–999', 1.15], ['1,000–2,999', 1.0], ['3,000–9,999', 0.93], ['10,000 +', 0.87]]
const KG_TIERS: Tiers = [['Trial: 300–999 kg (air)', 1.12], ['1–5 t', 1.0], ['Full container', 0.9]]

const APPAREL_CERTS = ['OEKO-TEX Standard 100', 'GOTS (organic)', 'GRS (recycled)', 'BCI / Better Cotton', 'amfori BSCI', 'WRAP', 'SEDEX / SMETA', 'LEED-certified factories']
const APPAREL_TESTS = ['Dimensional stability (shrinkage) AATCC 135 / ISO 6330', 'Colour fastness to washing ISO 105-C06 and rubbing ISO 105-X12', 'Spirality / torque after wash', 'Pilling ISO 12945', 'Fabric weight (GSM) and composition', 'Seam strength', 'AQL 2.5 final inspection (third-party on request: SGS, Intertek, Bureau Veritas)']

export const FAMILIES: Family[] = [
  /* =================== GARMENTS =================== */
  {
    id: 'tshirts', cat: 'garments', name: 'T-shirts', hs: '6109.10 (cotton) · 6109.90 (other fibres)',
    tag: "Bangladesh's biggest export item. Every neck, sleeve, fit, fabric and print.",
    intro: 'T-shirts are cut and sewn from knitted fabric, mostly single jersey. You choose the style, the fabric, the yarn quality, the weight in GSM (grams per square metre), the colour method and the decoration. The price builder shows how each choice moves the FOB price.',
    photo: 'tshirt-crew', moq: '500 pcs per style per colour (300 pcs from stock fabric)', lead: LEAD_KNIT,
    styles: [
      { n: 'Crew-neck basic tee', d: "Round rib neck, short sleeve, regular fit. The world's best-selling garment.", p: [1.65, 3.5], photo: 'tshirt-crew', b: 'M' },
      { n: 'V-neck tee', d: 'V-shaped neckline with rib binding.', p: [1.8, 3.6], photo: 'tshirt-v' },
      { n: 'Henley tee', d: 'Crew neck with a 2–3 button placket.', p: [2.4, 4.2], photo: 'tshirt-henley' },
      { n: 'Pocket tee', d: 'Chest patch pocket, workwear look.', p: [1.95, 3.8], photo: 'tshirt-pocket' },
      { n: 'Oversized / drop-shoulder tee', d: 'Heavyweight 220–260 GSM, boxy fit, streetwear.', p: [3.2, 5.5], photo: 'tshirt-oversized' },
      { n: 'Long-sleeve tee', d: 'Crew neck, long sleeves with rib cuffs.', p: [2.5, 4.5], photo: 'tshirt-long' },
      { n: 'Raglan / baseball tee', d: 'Diagonal raglan sleeve seams, often contrast sleeves.', p: [2.4, 4.2], photo: 'tshirt-raglan' },
      { n: 'Ringer tee', d: 'Contrast rib at neck and sleeve hems, retro style.', p: [2.1, 3.9], photo: 'tshirt-ringer' },
      { n: 'Tank top / vest', d: 'Sleeveless, scoop or racer back.', p: [1.3, 2.8], photo: 'tshirt-tank' },
      { n: 'Striped (yarn-dyed) tee', d: 'Breton or multi-stripe knitted into the fabric.', p: [2.6, 4.6], photo: 'tshirt-stripe' },
      { n: 'Vintage washed tee', d: 'Garment-dyed, acid or mineral washed for a worn-in look.', p: [3.0, 5.2], photo: 'tshirt-washed' },
      { n: 'Performance / dri-fit tee', d: '100% polyester or recycled poly, moisture-wicking, sublimation-ready.', p: [1.9, 3.8], photo: 'tshirt-sport' },
      { n: 'Printed promotional tee', d: 'Event, campaign and merchandise tees with 1–4 colour print.', p: [1.8, 3.4], photo: 'tshirt-print' },
    ],
    tables: [
      { title: 'Knit fabrics for T-shirts', cols: ['Fabric', 'Weight (GSM)', 'Look and feel', 'Best for'], rows: [
        ['Single jersey', '120–200', 'Smooth face, light, soft drape; 70–80% of all T-shirts', 'Everyday tees, promo tees'],
        ['Heavyweight jersey', '220–280', 'Thick, structured, boxy', 'Oversized and premium streetwear'],
        ['Slub jersey', '150–230', 'Thick-thin irregular yarn texture', 'Fashion and vintage looks'],
        ['Interlock (double knit)', '180–280', 'Smooth both sides, stable, does not curl', 'Premium tees, babywear'],
        ['Rib 1×1 / 2×2', '180–260', 'Vertical ribs, high stretch', 'Fitted tees, collars and cuffs'],
        ['Pique', '180–260', 'Honeycomb texture', 'Polo-style tees'],
        ['Waffle / thermal', '250–340', 'Square grid texture, warm', 'Long-sleeve layers'],
        ['Polyester interlock / mesh', '120–180', 'Light, quick-dry', 'Sports and team tees']] },
      { title: 'Yarn and fibre options', cols: ['Option', 'What it means', 'Price effect'], rows: [
        ['Carded open-end cotton', 'Coarser, cheapest spinning, slightly rough', 'Lowest'],
        ['Carded ring-spun cotton', 'Smoother and stronger than open-end', '+ small'],
        ['Combed ring-spun cotton', 'Short fibres removed: softer, cleaner, less pilling; industry quality standard', '+$0.15–0.30'],
        ['Compact combed cotton', 'Even smoother yarn, premium hand feel', '+$0.25–0.45'],
        ['Organic cotton (GOTS)', 'Certified organic fibre and processing', '+$0.40–0.80'],
        ['CVC 60/40 (cotton/poly)', 'Less shrinkage, holds colour, cheaper', '− small'],
        ['PC 65/35 (poly/cotton)', 'Durable, workwear and uniforms', '− small'],
        ['100% polyester / recycled polyester', 'Quick-dry, sublimation printing, GRS on request', 'Similar to cotton'],
        ['Cotton/elastane 95/5', 'Stretch and shape recovery', '+$0.20–0.40'],
        ['Modal or bamboo viscose blends', 'Silky, cool handfeel', '+$0.40–0.90']] },
      { title: 'Colour options', cols: ['Method', 'Description'], rows: [
        ['Solid piece-dyed', 'Fabric dyed to your Pantone after knitting (reactive dye on cotton).'],
        ['Melange / heather', 'Pre-dyed fibres blended for a speckled grey or coloured look.'],
        ['Yarn-dyed stripes', 'Stripes knitted in from dyed yarn: they never fade unevenly.'],
        ['Garment-dyed / pigment-dyed', 'Sewn first, dyed after for a soft lived-in look.'],
        ['All-over print', 'Whole fabric printed (rotary or sublimation on polyester).']] },
      { title: 'Decoration methods', cols: ['Method', 'Best for', 'Typical added cost / pc', 'Minimum'], rows: [
        ['Screen print (plastisol / water-based)', 'Bulk logos, 1–6 colours', '$0.10–0.30 first colour, +$0.05–0.10 each extra', '300 pcs per design'],
        ['Discharge / pigment print', 'Soft, vintage feel on dark colours', '$0.20–0.45', '300 pcs'],
        ['Puff / high-density / foil', '3D and metallic effects', '$0.25–0.60', '300 pcs'],
        ['DTF transfer', 'Full-colour detailed art, small runs', '$0.40–1.00', '100 pcs'],
        ['Heat transfer / rubber patch', 'Labels, numbers, logos', '$0.15–0.50', '300 pcs'],
        ['Embroidery', 'Chest logos, premium branding', '$0.25–0.80 (by stitch count)', '300 pcs'],
        ['Sublimation', 'All-over prints on polyester', '$0.50–1.20', '300 pcs']] },
      { title: 'Washes and finishes', cols: ['Finish', 'Effect'], rows: [
        ['Enzyme / bio wash', 'Removes surface fuzz, softer, less pilling'], ['Silicone softener', 'Extra smooth, silky hand'], ['Peach / brushed finish', 'Velvety surface'],
        ['Garment wash, acid or mineral wash', 'Vintage, faded look'], ['Anti-pilling, moisture-wicking, anti-odour, UV protection', 'Performance finishes']] },
      { title: 'Branding and packing trims', cols: ['Trim', 'Options'], rows: [
        ['Neck label', 'Woven, printed satin, or tagless heat-transfer print'], ['Care and size labels', "Printed to your market's rules (EU, UK, US, Canada bilingual)"],
        ['Hang tag', 'Your design, with barcode / RFID on request'], ['Polybag', 'Individual, with suffocation warning; recycled or biodegradable options'],
        ['Carton', '5-ply export carton with your shipping marks']] },
    ],
    sizes: "Adult XS–5XL · Kids 2–14 years · Size ratio per carton as you specify",
    packing: [['Packing', '1 pc folded in polybag, 50–72 pcs per 5-ply carton'], ['Carton size', 'about 60 × 40 × 35 cm, 0.08 CBM'], ['20 ft container', 'about 18,000–22,000 pcs (160 GSM)'], ['40 ft HC container', 'about 45,000–55,000 pcs (160 GSM)']],
    certs: APPAREL_CERTS, tests: APPAREL_TESTS,
    config: { baseFrom: 'styles', groups: [
      { name: 'Fabric weight', opts: [['Light 120–150 GSM', -0.15], ['Standard 160–180 GSM', 0], ['Mid 190–220 GSM', 0.35], ['Heavy 230–280 GSM', 0.85]] },
      { name: 'Yarn / fibre', opts: [['Carded ring-spun cotton (standard)', 0], ['Carded open-end cotton', -0.1], ['Combed ring-spun cotton', 0.2], ['Compact combed cotton', 0.35], ['Organic cotton (GOTS)', 0.6], ['CVC 60/40', -0.05], ['100% polyester', 0], ['Cotton/elastane 95/5', 0.3]] },
      { name: 'Decoration', opts: [['None (blank)', 0], ['Screen print 1 colour', 0.2], ['Screen print 3–4 colours', 0.4], ['Embroidery (small logo)', 0.45], ['DTF full colour', 0.7], ['Sublimation all-over', 0.9]] },
      { name: 'Finish', opts: [['Standard', 0], ['Enzyme wash + silicone', 0.15], ['Garment / acid wash', 0.55]] },
      { name: 'Quantity per style', tiers: QTY_TIERS }] },
  },
  {
    id: 'polos', cat: 'garments', name: 'Polo shirts', hs: '6105.10 (cotton) · 6105.20 (synthetic)',
    tag: 'Classic pique, corporate uniform, golf and performance polos.',
    intro: 'A polo is a knit shirt with a collar and a buttoned placket, usually in pique. Collar, placket and fabric choices set the look and price.',
    photo: 'polo-classic', moq: '500 pcs per style per colour', lead: LEAD_KNIT,
    styles: [
      { n: 'Classic pique polo', d: 'Single or double pique, flat-knit collar, 2–3 button placket.', p: [4.5, 6.5], photo: 'polo-classic', b: 'M' },
      { n: 'Corporate embroidered polo', d: 'Uniform polos with embroidered logo on chest.', p: [4.8, 7.0], photo: 'polo-corporate' },
      { n: 'Tipped-collar polo', d: 'Contrast stripes knitted into collar and cuffs.', p: [5.0, 7.2], photo: 'polo-tipped' },
      { n: 'Jersey polo', d: 'Smooth single-jersey body, softer and lighter.', p: [3.8, 5.8], photo: 'polo-jersey' },
      { n: 'Long-sleeve polo', d: 'Rib cuffs, autumn and uniform programs.', p: [5.2, 7.5], photo: 'polo-long' },
      { n: 'Performance / golf polo', d: 'Polyester or poly-spandex pique, wicking, UV finish.', p: [4.2, 6.8], photo: 'polo-golf' },
      { n: 'Striped polo', d: 'Yarn-dyed stripes through the body.', p: [5.2, 7.6], photo: 'polo-stripe' },
    ],
    tables: [
      { title: 'Polo fabrics', cols: ['Fabric', 'Weight (GSM)', 'Notes'], rows: [['Single pique (Lacoste)', '180–220', 'Classic honeycomb texture'], ['Double pique', '200–260', 'Heavier, crisper'], ['Honeycomb / waffle pique', '180–230', 'Open texture, breathable'], ['Single jersey', '170–200', 'Soft, casual'], ['Polyester pique / mesh', '140–180', 'Sports and golf'], ['CVC or PC pique', '180–230', 'Uniform durability, low shrinkage']] },
      { title: 'Collar and placket options', cols: ['Part', 'Options'], rows: [['Collar', 'Flat-knit rib, tipped flat-knit, self-fabric, woven shirt collar'], ['Placket', '2 or 3 buttons, hidden placket, zip placket, contrast placket'], ['Buttons', 'Horn-look, pearl, metal, engraved logo'], ['Hem', 'Straight, side vents, tennis tail (longer back)']] },
    ],
    sizes: "XS–5XL; women's fitted block available", packing: [['Packing', '1 pc folded with collar support, polybag; 40–50 pcs per carton'], ['40 ft HC container', 'about 25,000–30,000 pcs']], certs: APPAREL_CERTS, tests: APPAREL_TESTS,
    config: { baseFrom: 'styles', groups: [{ name: 'Fabric', opts: [['Single pique 200 GSM', 0], ['Double pique 240 GSM', 0.45], ['Jersey 180 GSM', -0.3], ['Polyester pique', -0.1], ['Organic cotton pique', 0.8]] }, { name: 'Branding', opts: [['None', 0], ['Embroidered chest logo', 0.45], ['Screen print', 0.25], ['Woven badge', 0.35]] }, { name: 'Quantity per style', tiers: QTY_TIERS }] },
  },
  {
    id: 'fleece', cat: 'garments', name: 'Hoodies, sweatshirts & fleece', hs: '6110.20 (cotton) · 6110.30 (synthetic)',
    tag: 'Pullover and zip hoodies, crewnecks, half-zips and joggers.',
    intro: 'Sweatshirts and hoodies use looped-back French terry or brushed fleece. Weight in GSM and the brushed or unbrushed back set warmth and price.',
    photo: 'hoodie-pullover', moq: '500 pcs per style per colour', lead: LEAD_KNIT,
    styles: [
      { n: 'Pullover hoodie', d: 'Lined hood, kangaroo pocket, rib cuffs and hem.', p: [5.5, 9.5], photo: 'hoodie-pullover' },
      { n: 'Zip-through hoodie', d: 'Full-length zip, two pockets.', p: [6.5, 11.0], photo: 'hoodie-zip' },
      { n: 'Crewneck sweatshirt', d: 'Classic crew with rib trims.', p: [3.15, 7.5], photo: 'sweatshirt-crew', b: 'M' },
      { n: 'Half-zip / quarter-zip', d: 'Stand collar with short zip.', p: [6.0, 10.0], photo: 'sweatshirt-halfzip' },
      { n: 'Oversized heavyweight hoodie', d: '380–450 GSM, drop shoulder, streetwear.', p: [8.5, 13.0], photo: 'hoodie-oversized' },
      { n: 'Jogger pants (fleece)', d: 'Elastic waist with drawcord, rib cuffs.', p: [4.5, 8.0], photo: 'joggers' },
      { n: 'Polar fleece jacket', d: 'Anti-pill polyester polar fleece, zip front.', p: [5.0, 9.0], photo: 'polar-fleece' },
    ],
    tables: [
      { title: 'Fleece fabrics', cols: ['Fabric', 'Weight (GSM)', 'Notes'], rows: [['French terry (unbrushed)', '240–330', 'Loops inside, lighter, all-season'], ['Brushed fleece', '280–400', 'Soft brushed inside, warm'], ['Heavyweight fleece', '400–480', 'Premium streetwear'], ['CVC / poly-cotton fleece', '260–360', 'Less shrinkage, cheaper'], ['Polar fleece (100% poly)', '180–300', 'Both sides brushed, anti-pill'], ['Recycled poly fleece', '200–320', 'GRS certified on request']] },
      { title: 'Construction options', cols: ['Part', 'Options'], rows: [['Hood', 'Single or double layer, with or without drawcord (no cords for kids)'], ['Pocket', 'Kangaroo, split kangaroo, side seam, zip pockets'], ['Trims', 'Metal or plastic eyelets, flat or round drawcords, YKK or local zips']] },
    ],
    sizes: 'XS–5XL; kids 4–14 years', packing: [['Packing', '1 pc polybag, 20–30 pcs per carton'], ['40 ft HC container', 'about 12,000–16,000 pcs']], certs: APPAREL_CERTS, tests: APPAREL_TESTS,
    config: { baseFrom: 'styles', groups: [{ name: 'Fabric', opts: [['French terry 280 GSM', 0], ['Brushed fleece 320 GSM', 0.4], ['Heavyweight 420 GSM', 1.6], ['CVC fleece', -0.3], ['Organic cotton fleece', 1.2]] }, { name: 'Decoration', opts: [['None', 0], ['Screen print', 0.35], ['Embroidery', 0.7], ['Puff print', 0.55]] }, { name: 'Quantity per style', tiers: QTY_TIERS }] },
  },
  {
    id: 'shirts', cat: 'garments', name: 'Woven shirts & blouses', hs: "6205.20 (men's cotton) · 6206.30 (women's cotton)",
    tag: 'Formal, oxford, flannel, denim, linen and printed shirts.',
    intro: 'Woven shirts are sewn from woven fabric. Yarn count (40s, 50s, 60s…) and weave decide how fine and smooth the shirt is.',
    photo: 'shirt-formal', moq: '500 pcs per style per colour', lead: LEAD_WOVEN,
    styles: [
      { n: 'Formal dress shirt', d: 'Cotton poplin, cut-away or spread collar, single cuffs.', p: [5.5, 8.5], photo: 'shirt-formal', b: 'M' },
      { n: 'Oxford button-down', d: 'Oxford weave, button-down collar, chest pocket.', p: [5.8, 8.8], photo: 'shirt-oxford' },
      { n: 'Flannel check shirt', d: 'Brushed yarn-dyed checks.', p: [6.0, 9.5], photo: 'shirt-flannel' },
      { n: 'Denim / chambray shirt', d: 'Indigo denim or chambray, western or casual.', p: [6.5, 10.0], photo: 'shirt-denim' },
      { n: 'Linen shirt', d: '100% linen or linen-cotton, summer.', p: [7.5, 12.0], photo: 'shirt-linen' },
      { n: 'Short-sleeve printed shirt', d: 'Camp collar, viscose or cotton prints.', p: [5.0, 8.0], photo: 'shirt-printed' },
      { n: "Women's blouse", d: 'Viscose, georgette or cotton voile blouses.', p: [4.5, 8.5], photo: 'blouse' },
    ],
    tables: [
      { title: 'Shirt fabrics', cols: ['Fabric', 'Typical count', 'Notes'], rows: [['Poplin', '40s–80s', 'Smooth, crisp; formal shirts'], ['Oxford', '20s–40s', 'Basket weave, casual'], ['Twill', '40s–60s', 'Diagonal weave, soft drape'], ['Flannel', '10s–20s brushed', 'Warm, yarn-dyed checks'], ['Chambray / denim', '4–8 oz', 'Indigo casual'], ['Dobby / jacquard', '50s–80s', 'Small woven patterns'], ['Linen / linen-cotton', '14 lea–40s', 'Cool, natural slub'], ['Viscose / rayon prints', '—', 'Fluid drape for printed shirts']] },
      { title: 'Finishes', cols: ['Finish', 'Effect'], rows: [['Easy-care / non-iron', 'Resin finish, fewer wrinkles'], ['Mercerised', 'Lustre and strength'], ['Garment wash', 'Soft casual look']] },
    ],
    sizes: "Collar 14–19 in or S–4XL; women's 6–20 / XS–XXL", packing: [['Packing', 'Folded with collar stand and pins or tissue, 30–40 pcs per carton'], ['40 ft HC container', 'about 18,000–24,000 pcs']], certs: APPAREL_CERTS, tests: APPAREL_TESTS,
    config: { baseFrom: 'styles', groups: [{ name: 'Yarn count', opts: [['40s standard', 0], ['50s–60s fine', 0.7], ['80s two-ply premium', 2.0]] }, { name: 'Finish', opts: [['Standard', 0], ['Easy-care / non-iron', 0.6], ['Garment wash', 0.4]] }, { name: 'Quantity per style', tiers: QTY_TIERS }] },
  },
  {
    id: 'denim', cat: 'garments', name: 'Denim jeans & jackets', hs: "6203.42 (men's) · 6204.62 (women's)",
    tag: 'Five-pocket jeans in every fit and wash, denim jackets, shorts and skirts.',
    intro: 'Denim is a cotton twill woven with indigo-dyed warp yarn. Fabric weight in ounces, stretch and the wash define the product.',
    photo: 'jeans-slim', moq: '500 pcs per style per wash', lead: LEAD_WOVEN,
    styles: [
      { n: 'Slim-fit jeans', d: 'Tapered leg, stretch denim.', p: [7.8, 12.5], photo: 'jeans-slim', b: 'M' },
      { n: 'Straight / regular jeans', d: 'Classic straight leg.', p: [7.8, 12.0], photo: 'jeans-straight', b: 'M' },
      { n: 'Skinny jeans (women)', d: 'High-stretch, high-rise.', p: [7.5, 12.0], photo: 'jeans-skinny' },
      { n: 'Wide-leg / relaxed jeans', d: 'Loose fit, trend styles.', p: [8.5, 14.0], photo: 'jeans-wide' },
      { n: 'Denim jacket', d: 'Trucker style, button front.', p: [9.5, 15.0], photo: 'denim-jacket' },
      { n: 'Denim shorts', d: "Cut-off or hemmed, men's and women's.", p: [5.0, 8.5], photo: 'denim-shorts' },
      { n: 'Denim skirt', d: 'Mini, midi and A-line.', p: [5.5, 9.0], photo: 'denim-skirt' },
    ],
    tables: [
      { title: 'Denim fabrics', cols: ['Fabric', 'Weight', 'Notes'], rows: [['Rigid 100% cotton', '12–14 oz', 'Classic, breaks in over time'], ['Comfort stretch (1–2% elastane)', '10–12 oz', 'Most popular for jeans'], ['Power stretch (3–4% elastane)', '8–10 oz', 'Skinny and jeggings'], ['Lightweight denim / chambray', '5–8 oz', 'Shirts, dresses'], ['Recycled / organic cotton denim', '10–13 oz', 'Sustainability programs']] },
      { title: 'Washes and effects', cols: ['Wash', 'Look'], rows: [['Rinse / raw', 'Dark, clean indigo'], ['Stone or enzyme wash', 'Mid-blue, softened'], ['Bleach wash', 'Light blue'], ['Acid / snow wash', 'Mottled contrast'], ['Laser and ozone finishing', 'Whiskers and fades with far less water and chemicals'], ['Distressing', 'Rips, repairs, frayed hems']] },
    ],
    sizes: "Waist 26–44 in; length 30–34 in; women's 24–34", packing: [['Packing', 'Folded, polybag, 24–36 pcs per carton'], ['40 ft HC container', 'about 14,000–18,000 pcs']], certs: APPAREL_CERTS, tests: APPAREL_TESTS,
    config: { baseFrom: 'styles', groups: [{ name: 'Fabric', opts: [['Comfort stretch 11 oz', 0], ['Rigid 13 oz', 0.4], ['Power stretch 9 oz', 0.2], ['Organic / recycled cotton', 1.2]] }, { name: 'Wash', opts: [['Rinse', 0], ['Stone / enzyme', 0.6], ['Bleach or acid', 0.9], ['Laser + ozone fades', 1.1], ['Heavy distressing', 1.6]] }, { name: 'Quantity per style', tiers: QTY_TIERS }] },
  },
  {
    id: 'trousers', cat: 'garments', name: 'Trousers, chinos & shorts', hs: '6203.42 · 6203.43 · 6204.62',
    tag: 'Chinos, cargo, work trousers, formal trousers and shorts.',
    intro: 'Woven bottoms in cotton twill, stretch twill, ripstop and canvas, garment-dyed or piece-dyed.',
    photo: 'chinos', moq: '500 pcs per style per colour', lead: LEAD_WOVEN,
    styles: [
      { n: 'Chino trousers', d: 'Slant pockets, stretch twill.', p: [7.0, 9.0], photo: 'chinos', b: 'M' },
      { n: 'Cargo trousers', d: 'Side cargo pockets, ripstop or twill.', p: [8.0, 12.0], photo: 'cargo' },
      { n: 'Chino / cargo shorts', d: 'Above-knee shorts.', p: [4.5, 7.5], photo: 'shorts-chino' },
      { n: 'Work trousers', d: 'Canvas or PC twill, reinforced, knee-pad pockets.', p: [8.5, 13.0], photo: 'work-trousers' },
      { n: 'Formal trousers', d: 'Poly-viscose or wool-look suiting.', p: [7.5, 12.0], photo: 'formal-trousers' },
    ],
    tables: [{ title: 'Fabrics', cols: ['Fabric', 'Weight', 'Notes'], rows: [['Cotton twill', '7–9 oz', 'Classic chino'], ['Stretch twill (2% elastane)', '7–9 oz', 'Comfort fit'], ['Ripstop', '6–8 oz', 'Tear-resistant, cargo'], ['Canvas / duck', '10–12 oz', 'Workwear'], ['Poly-viscose suiting', '220–280 GSM', 'Formal trousers']] }],
    sizes: 'Waist 28–44 in', packing: [['Packing', 'Folded, polybag, 24–40 pcs per carton'], ['40 ft HC container', 'about 16,000–20,000 pcs']], certs: APPAREL_CERTS, tests: APPAREL_TESTS,
    config: { baseFrom: 'styles', groups: [{ name: 'Fabric', opts: [['Cotton twill', 0], ['Stretch twill', 0.4], ['Ripstop', 0.3], ['Canvas', 0.8]] }, { name: 'Dyeing', opts: [['Piece-dyed', 0], ['Garment-dyed', 0.7]] }, { name: 'Quantity per style', tiers: QTY_TIERS }] },
  },
  {
    id: 'outerwear', cat: 'garments', name: 'Jackets & outerwear', hs: '6201.40 · 6202.40',
    tag: 'Puffers, bombers, windbreakers, parkas, vests and rain jackets.',
    intro: 'Outerwear combines a shell fabric, lining and insulation. Fill weight and water resistance drive price.',
    photo: 'puffer', moq: '500 pcs per style per colour', lead: LEAD_WOVEN,
    styles: [
      { n: 'Puffer jacket', d: 'Quilted shell with polyester wadding 120–200 g/m².', p: [12.0, 20.0], photo: 'puffer', b: 'M' },
      { n: 'Bomber jacket', d: 'Nylon or polyester shell, rib collar and cuffs.', p: [12.0, 18.0], photo: 'bomber', b: 'M' },
      { n: 'Windbreaker', d: 'Light nylon or polyester, packable, hood.', p: [7.0, 12.0], photo: 'windbreaker' },
      { n: 'Parka', d: 'Long insulated jacket with hood.', p: [16.0, 28.0], photo: 'parka' },
      { n: 'Quilted vest / gilet', d: 'Sleeveless puffer.', p: [8.0, 13.0], photo: 'vest' },
      { n: 'Rain jacket', d: 'PU-coated or laminated, taped seams.', p: [9.0, 16.0], photo: 'rain-jacket' },
    ],
    tables: [{ title: 'Shell and insulation', cols: ['Component', 'Options'], rows: [['Shell', 'Nylon taslan, polyester pongee, micro-peach, ripstop, recycled polyester'], ['Water resistance', 'DWR finish, PU coating, laminated membrane (3,000–10,000 mm)'], ['Insulation', 'Polyester wadding 80–200 g/m², recycled wadding'], ['Lining', 'Taffeta, mesh, fleece'], ['Trims', 'YKK or local zips, snaps, toggles, reflective tape']] }],
    sizes: 'XS–4XL; kids 4–14', packing: [['Packing', '1 pc polybag, 10–20 pcs per carton (vacuum on request)'], ['40 ft HC container', 'about 5,000–9,000 pcs']], certs: APPAREL_CERTS, tests: [...APPAREL_TESTS, 'Water repellency / hydrostatic head', 'Down-proofness (for down)'],
    config: { baseFrom: 'styles', groups: [{ name: 'Insulation', opts: [['120 g/m²', 0], ['160 g/m²', 1.0], ['200 g/m²', 2.0]] }, { name: 'Water protection', opts: [['DWR finish', 0], ['PU coating', 0.8], ['Laminated membrane, taped seams', 3.0]] }, { name: 'Quantity per style', tiers: QTY_TIERS }] },
  },
  {
    id: 'kids', cat: 'garments', name: 'Babywear & kidswear', hs: '6111.20 (babies) · 6109.10 · 6104.62',
    tag: 'Bodysuits, rompers, sleepsuits, sets, dresses and kids basics.',
    intro: 'Babywear is made in soft interlock and rib, often organic cotton, under strict child-safety rules for snaps, cords and small parts.',
    photo: 'baby-bodysuit', moq: '1,000 pcs per style (multi-pack programs welcome)', lead: LEAD_KNIT,
    styles: [
      { n: 'Baby bodysuit', d: 'Envelope neck, snap crotch, short or long sleeve.', p: [1.2, 2.2], photo: 'baby-bodysuit' },
      { n: 'Romper / sleepsuit', d: 'Full-length with snaps or zip, footed or footless.', p: [2.2, 3.8], photo: 'baby-romper' },
      { n: 'Kids T-shirt', d: 'Plain or printed, ages 2–14.', p: [1.25, 1.75], photo: 'kids-tee', b: 'M' },
      { n: 'Kids pyjama set', d: 'Two-piece printed sets.', p: [3.0, 5.0], photo: 'kids-pyjama' },
      { n: "Girls' dress", d: 'Jersey or woven cotton dresses.', p: [2.8, 5.5], photo: 'girls-dress' },
      { n: 'Kids hoodie and jogger set', d: 'French terry two-piece.', p: [5.0, 8.0], photo: 'kids-set' },
    ],
    tables: [
      { title: 'Fabrics', cols: ['Fabric', 'Weight (GSM)', 'Notes'], rows: [['Interlock', '180–220', 'Smooth, stable, babywear standard'], ['1×1 rib', '180–220', 'Stretchy, fitted'], ['Single jersey', '140–180', 'Tees and dresses'], ['Organic cotton (GOTS)', '—', 'Most requested for baby programs'], ['Muslin / gauze', '—', 'Swaddles and summer sets']] },
      { title: 'Child safety', cols: ['Rule', 'How we comply'], rows: [['No drawcords at neck/hood (EN 14682, US 16 CFR 1120)', 'Cords removed or replaced with flat elastic'], ['Snap pull strength', 'Nickel-free snaps tested for pull force'], ['Small parts / choking hazard', 'No loose buttons or decorations under 3 years'], ['Chemicals', 'OEKO-TEX class 1 (baby) fabrics, CPSIA lead limits for the US']] },
    ],
    sizes: 'Newborn–24 months; kids 2–14 years', packing: [['Packing', 'Single or multi-packs (3-pack, 5-pack), 50–100 pcs per carton'], ['40 ft HC container', 'about 60,000–90,000 pcs (bodysuits)']], certs: APPAREL_CERTS, tests: [...APPAREL_TESTS, 'Snap pull test', 'Small parts test'],
    config: { baseFrom: 'styles', groups: [{ name: 'Fabric', opts: [['Cotton interlock', 0], ['Organic cotton (GOTS)', 0.35], ['Bamboo viscose', 0.6]] }, { name: 'Print', opts: [['Plain', 0], ['Screen print', 0.15], ['All-over print', 0.4]] }, { name: 'Quantity per style', tiers: QTY_TIERS }] },
  },
  {
    id: 'active', cat: 'garments', name: 'Activewear & sportswear', hs: '6114.30 · 6104.63 · 6112.12',
    tag: 'Leggings, sports bras, training tees, tracksuits and sublimated team kits.',
    intro: 'Activewear uses polyester or nylon with elastane for stretch, wicking and quick drying. Team kits are fully sublimated with names and numbers.',
    photo: 'leggings', moq: '500 pcs per style (team kits from 100 sets)', lead: LEAD_KNIT,
    styles: [
      { n: 'Leggings', d: 'High-waist, squat-proof, hidden pocket.', p: [3.5, 6.5], photo: 'leggings' },
      { n: 'Sports bra', d: 'Removable pads, racer back.', p: [2.5, 4.8], photo: 'sports-bra' },
      { n: 'Training tee', d: 'Quick-dry polyester or recycled poly.', p: [1.9, 3.8], photo: 'tshirt-sport' },
      { n: 'Tracksuit', d: 'Jacket and pants, polyester tricot or knit.', p: [9.0, 15.0], photo: 'tracksuit' },
      { n: 'Sublimated team jersey', d: 'Football, cricket, basketball kits with names and numbers.', p: [3.2, 6.0], photo: 'team-jersey' },
      { n: 'Running shorts', d: 'Lightweight woven or knit with brief liner.', p: [2.5, 4.5], photo: 'running-shorts' },
    ],
    tables: [{ title: 'Performance fabrics', cols: ['Fabric', 'Composition', 'Notes'], rows: [['Poly-spandex jersey', '88/12', 'Leggings, bras'], ['Nylon-spandex', '78/22', 'Premium soft, high stretch'], ['Polyester bird-eye mesh', '100% poly', 'Jerseys, breathable'], ['Recycled polyester', 'rPET', 'GRS certified'], ['Tricot', '100% poly', 'Tracksuits']] }],
    sizes: 'XS–3XL', packing: [['Packing', '1 pc polybag, 50–100 pcs per carton'], ['40 ft HC container', 'about 40,000–60,000 pcs (leggings)']], certs: APPAREL_CERTS, tests: [...APPAREL_TESTS, 'Wicking and drying rate', 'Squat-proof opacity'],
    config: { baseFrom: 'styles', groups: [{ name: 'Fabric', opts: [['Polyester-spandex', 0], ['Nylon-spandex', 0.9], ['Recycled polyester', 0.3]] }, { name: 'Decoration', opts: [['None', 0], ['Heat-transfer logo', 0.2], ['Full sublimation', 0.8]] }, { name: 'Quantity per style', tiers: QTY_TIERS }] },
  },
  {
    id: 'intimates', cat: 'garments', name: 'Innerwear & sleepwear', hs: '6107.11 · 6108.21 · 6107.21',
    tag: 'Briefs, boxers, trunks, vests, socks and pyjama sets in multi-packs.',
    intro: 'Bangladesh is a top supplier of basic underwear and nightwear to Europe. These ship in multi-packs on long-running programs.',
    photo: 'boxer-briefs', moq: '3,000 pcs per style (multi-pack programs)', lead: LEAD_KNIT,
    styles: [
      { n: "Men's boxer briefs / trunks", d: 'Cotton-elastane jersey, knitted waistband.', p: [0.7, 1.4], photo: 'boxer-briefs' },
      { n: "Women's briefs", d: 'Cotton or modal, 3–7 packs.', p: [0.45, 0.95], photo: 'briefs' },
      { n: 'Woven boxer shorts', d: 'Poplin or flannel prints.', p: [1.1, 1.9], photo: 'woven-boxers' },
      { n: 'Vests / undershirts', d: 'Rib or jersey.', p: [0.8, 1.5], photo: 'vest-under' },
      { n: 'Pyjama set', d: 'Jersey or woven, short or long.', p: [3.5, 6.5], photo: 'pyjamas' },
      { n: 'Socks', d: 'Cotton, terry sole, multi-packs.', p: [0.2, 0.6], u: 'pair', photo: 'socks' },
    ],
    tables: [{ title: 'Fabrics', cols: ['Fabric', 'Composition'], rows: [['Single jersey', '95% cotton / 5% elastane'], ['Rib', '100% cotton or cotton-elastane'], ['Modal jersey', '92% modal / 8% elastane'], ['Microfibre', 'Polyamide-elastane'], ['Poplin / flannel', '100% cotton (woven boxers, pyjamas)']] }],
    sizes: 'S–3XL', packing: [['Packing', 'Multi-packs in printed boxes or bags, 72–144 pcs per carton'], ['40 ft HC container', 'about 150,000–250,000 pcs (briefs)']], certs: APPAREL_CERTS, tests: APPAREL_TESTS,
    config: { baseFrom: 'styles', groups: [{ name: 'Fabric', opts: [['Cotton-elastane', 0], ['Modal', 0.25], ['Organic cotton', 0.2]] }, { name: 'Packaging', opts: [['Polybag', 0], ['Printed retail box', 0.12]] }, { name: 'Quantity per style', tiers: QTY_TIERS }] },
  },

  /* =================== FOOTWEAR & LEATHER =================== */
  {
    id: 'casual-footwear', cat: 'footwear', name: 'Slides, sandals & sneakers', hs: '6402.20 · 6402.99 · 6404.19',
    tag: 'EVA and PU slides, sandals, flip-flops, mules and sneakers from verified factories.',
    intro: 'We manufacture this range ourselves, so we control the moulds, materials, colours and delivery dates. Upper material and sole type set the price.',
    photo: 'slides', moq: '600 pairs per design (300 pairs on existing moulds)', lead: LEAD_SHOE,
    styles: [
      { n: 'EVA / PU slides', d: 'One-strap or two-strap, embossed logo.', p: [2.5, 4.0], u: 'pair', photo: 'slides' },
      { n: 'Flip-flops', d: 'Rubber or EVA, printed straps.', p: [0.9, 2.0], u: 'pair', photo: 'flipflops' },
      { n: "Men's sandals", d: 'PU or leather straps, cushioned footbed.', p: [4.0, 7.0], u: 'pair', photo: 'sandals-men' },
      { n: "Women's flat sandals", d: 'Strappy, embellished or plain.', p: [4.0, 7.5], u: 'pair', photo: 'sandals-women' },
      { n: 'Mules and clogs', d: 'Backless slip-ons, cork or EVA soles.', p: [4.5, 8.0], u: 'pair', photo: 'mules' },
      { n: 'Canvas sneakers', d: 'Vulcanised rubber sole, lace-up or slip-on.', p: [5.5, 9.0], u: 'pair', photo: 'canvas-sneakers' },
      { n: 'PU / knit sneakers', d: 'Cemented EVA or TPR sole.', p: [7.0, 12.0], u: 'pair', photo: 'sneakers' },
      { n: 'Kids sandals and shoes', d: 'Velcro straps, soft soles.', p: [2.5, 5.5], u: 'pair', photo: 'kids-shoes' },
    ],
    tables: [
      { title: 'Upper materials', cols: ['Material', 'Notes'], rows: [['PU synthetic leather', 'Most popular, many textures and colours'], ['PVC', 'Low cost, waterproof'], ['Canvas / textile', 'Sneakers and espadrilles'], ['Knit (sock-like)', 'Light sneakers'], ['Genuine leather', 'See leather shoes']] },
      { title: 'Sole types', cols: ['Sole', 'Notes'], rows: [['EVA (injected or sheet)', 'Very light, cushioned; slides and casual'], ['PU', 'Light, durable, comfortable'], ['TPR', 'Rubber-like grip, lower cost'], ['Rubber (vulcanised)', 'Classic sneakers, long-lasting'], ['PVC', 'Economy sandals'], ['Cork / latex footbed', 'Comfort sandals']] },
      { title: 'Footwear tests', cols: ['Test', 'Purpose'], rows: [['Sole bond strength', 'Upper does not separate'], ['Flex resistance', 'Sole does not crack'], ['Abrasion and slip resistance', 'Wear life and safety'], ['AZO dyes, phthalates, REACH, CPSIA', 'Chemical compliance for EU and US']] },
    ],
    sizes: 'EU 35–47 (UK 3–12, US 4–13); kids EU 20–34', packing: [['Packing', 'Pair in polybag or printed box, 12–24 pairs per carton'], ['40 ft HC container', 'about 8,000–15,000 pairs (boxed) or 20,000+ (slides, bagged)']], certs: ['Own-factory QC', 'Third-party inspection on request', 'REACH / CPSIA chemical tests'], tests: ['Bond strength', 'Flex test', 'Colour fastness', 'Size and fit check', 'Final AQL 2.5'],
    config: { baseFrom: 'styles', groups: [{ name: 'Upper', opts: [['PU synthetic', 0], ['PVC', -0.4], ['Canvas / textile', 0.2], ['Genuine leather', 2.5]] }, { name: 'Packaging', opts: [['Polybag', 0], ['Printed shoe box', 0.35]] }, { name: 'Quantity per design', tiers: [['300–599 pairs', 1.12], ['600–1,999', 1.0], ['2,000–4,999', 0.94], ['5,000 +', 0.88]] }] },
  },
  {
    id: 'leather-shoes', cat: 'footwear', name: 'Leather shoes & boots', hs: '6403.51 · 6403.59 · 6403.99',
    tag: 'Derbies, oxfords, loafers, chelsea boots, leather sandals and safety shoes.',
    intro: 'Bangladesh has its own hides and tanneries, so leather footwear is a strong export. Most are cemented construction; stitched (Blake) on request.',
    photo: 'leather-oxford', moq: '300 pairs per design', lead: LEAD_SHOE,
    styles: [
      { n: 'Oxford and derby shoes', d: 'Formal lace-ups in calf or cow leather.', p: [14.0, 24.0], u: 'pair', photo: 'leather-oxford' },
      { n: 'Loafers', d: 'Penny, tassel and moccasin styles.', p: [12.0, 22.0], u: 'pair', photo: 'loafers' },
      { n: 'Chelsea and lace-up boots', d: 'Elastic gusset or lace-up ankle boots.', p: [18.0, 30.0], u: 'pair', photo: 'chelsea-boots' },
      { n: 'Leather sandals', d: 'Hand-finished, kolhapuri and strap styles.', p: [8.0, 14.0], u: 'pair', photo: 'leather-sandals' },
      { n: 'Safety shoes', d: 'Steel or composite toe, PU/rubber sole.', p: [12.0, 20.0], u: 'pair', photo: 'safety-shoes' },
    ],
    tables: [{ title: 'Leathers', cols: ['Leather', 'Notes'], rows: [['Cow / calf full-grain', 'Premium formal shoes'], ['Corrected grain / pull-up', 'Smart casual'], ['Suede and nubuck', 'Casual, boots'], ['Goat leather', 'Soft, light'], ['Buffalo', 'Thick, rugged boots']] }],
    sizes: 'EU 38–47', packing: [['Packing', 'Pair in shoe box with tissue, 10–12 pairs per carton'], ['40 ft HC container', 'about 6,000–9,000 pairs']], certs: ['LWG-rated tanneries on request', 'REACH chromium VI tests'], tests: ['Bond strength', 'Flex', 'Colour rub', 'Chromium VI test'],
    config: { baseFrom: 'styles', groups: [{ name: 'Leather', opts: [['Corrected grain cow', 0], ['Full-grain calf', 4.0], ['Suede', 1.0]] }, { name: 'Construction', opts: [['Cemented', 0], ['Blake stitched', 3.5]] }, { name: 'Quantity per design', tiers: [['300–599 pairs', 1.1], ['600–1,999', 1.0], ['2,000 +', 0.93]] }] },
  },
  {
    id: 'leather-goods', cat: 'footwear', name: 'Leather goods & bags', hs: '4203.30 · 4202.31 · 4202.21',
    tag: 'Belts, wallets, card holders, handbags, laptop bags and gloves.',
    intro: 'Small leather goods from Bangladeshi cow and goat leather, with private-label embossing and gift packaging.',
    photo: 'wallet', moq: '300–500 pcs per design', lead: [['Sampling', 10, 14], ['Leather and hardware', 7, 15], ['Cutting and stitching', 10, 20], ['Finishing and packing', 3, 5]],
    styles: [
      { n: 'Leather belts', d: 'Pin buckle, reversible, braided.', p: [3.0, 7.0], photo: 'belt' },
      { n: 'Wallets', d: 'Bifold, trifold, zip-around, RFID-blocking.', p: [3.0, 9.0], photo: 'wallet' },
      { n: 'Card holders', d: 'Slim, 4–6 slots.', p: [1.5, 4.0], photo: 'card-holder' },
      { n: 'Handbags and totes', d: 'Shoulder bags, totes, crossbody.', p: [12.0, 35.0], photo: 'handbag' },
      { n: 'Laptop and messenger bags', d: 'Business bags with padding.', p: [18.0, 40.0], photo: 'laptop-bag' },
      { n: 'Leather gloves', d: 'Dress, driving and work gloves.', p: [3.5, 9.0], u: 'pair', photo: 'gloves' },
    ],
    tables: [{ title: 'Options', cols: ['Part', 'Options'], rows: [['Leather', 'Cow (full-grain, crunch, nappa), goat, PU alternative'], ['Hardware', 'Nickel-free buckles and zips, antique brass, gunmetal'], ['Branding', 'Blind or foil emboss, metal badge, printed lining'], ['Packaging', 'Gift box, dust bag, polybag']] }],
    sizes: 'Belts 85–125 cm; bags to your spec', packing: [['Packing', 'Gift box or polybag, 50–200 pcs per carton']], certs: ['LWG tanneries on request'], tests: ['Colour rub', 'Hardware salt-spray test', 'Stitch strength'],
    config: { baseFrom: 'styles', groups: [{ name: 'Leather', opts: [['Cow leather', 0], ['Full-grain premium', 1.5], ['PU alternative', -1.0]] }, { name: 'Packaging', opts: [['Polybag', 0], ['Gift box', 0.6]] }, { name: 'Quantity per design', tiers: QTY_TIERS }] },
  },

  /* =================== HOME TEXTILES =================== */
  {
    id: 'towels', cat: 'home', name: 'Towels', hs: '6302.60',
    tag: 'Bath, hand, face, beach, hotel and kitchen towels in terry, velour and jacquard.',
    intro: 'Towels are priced by weight. GSM (grams per square metre) decides how thick and absorbent they are; yarn type decides softness.',
    photo: 'bath-towels', moq: '1,000 kg or 2,000 pcs per design', lead: [['Sampling', 7, 10], ['Yarn and weaving', 10, 20], ['Dyeing, cutting, hemming', 7, 10], ['Inspection and packing', 3, 5]],
    styles: [
      { n: 'Bath towel', d: '70×140 cm, 450–600 GSM.', p: [3.0, 7.0], u: 'kg', photo: 'bath-towels' },
      { n: 'Hand and face towel set', d: '50×100 and 30×30 cm.', p: [3.0, 7.0], u: 'kg', photo: 'hand-towels' },
      { n: 'Hotel white towel', d: 'Dobby border, 500–650 GSM, high wash durability.', p: [3.2, 6.5], u: 'kg', photo: 'hotel-towels' },
      { n: 'Beach towel', d: 'Velour printed or jacquard, 90×170 cm.', p: [3.5, 7.5], u: 'kg', photo: 'beach-towel' },
      { n: 'Bathrobe', d: 'Terry or waffle, shawl collar.', p: [6.0, 12.0], photo: 'bathrobe' },
    ],
    tables: [
      { title: 'Towel types', cols: ['Type', 'Weight (GSM)', 'Notes'], rows: [['Terry (loop pile)', '350–700', 'Most absorbent'], ['Velour (sheared)', '400–550', 'Velvety, takes prints'], ['Jacquard', '450–600', 'Woven-in patterns'], ['Waffle', '250–400', 'Light, fast-drying'], ['Zero-twist / low-twist', '500–650', 'Extra soft, premium']] },
      { title: 'Yarn', cols: ['Yarn', 'Notes'], rows: [['Carded ring cotton', 'Standard'], ['Combed cotton', 'Softer, less lint'], ['Organic or BCI cotton', 'Certified programs'], ['Bamboo-cotton', 'Silky, premium']] },
    ],
    sizes: 'Face 30×30 · Hand 50×100 · Bath 70×140 · Bath sheet 90×160 cm or to spec', packing: [['Packing', 'Folded with band or in retail bag, 40–60 kg per carton'], ['40 ft HC container', 'about 12–15 tonnes']], certs: ['OEKO-TEX Standard 100', 'BCI', 'GOTS'], tests: ['Absorbency', 'Colour fastness', 'Dimensional stability', 'Weight per piece'],
    config: { baseFrom: 'styles', groups: [{ name: 'Weight', opts: [['400 GSM', -0.3], ['500 GSM', 0], ['600 GSM', 0.3]] }, { name: 'Yarn', opts: [['Carded cotton', 0], ['Combed cotton', 0.4], ['Zero-twist', 0.9], ['Organic', 0.8]] }, { name: 'Quantity', tiers: [['1–3 t', 1.0], ['3–10 t', 0.94], ['Full container', 0.9]] }] },
  },
  {
    id: 'bedding', cat: 'home', name: 'Bed linen', hs: '6302.21 · 6302.31',
    tag: 'Sheets, fitted sheets, duvet covers, pillowcases and quilts.',
    intro: 'Bed linen is woven in percale or sateen. Thread count and yarn define softness and price.',
    photo: 'bed-sheets', moq: '500 sets per design', lead: LEAD_WOVEN,
    styles: [
      { n: 'Flat and fitted sheet set', d: 'With pillowcases, single to king.', p: [6.0, 14.0], u: 'set', photo: 'bed-sheets' },
      { n: 'Duvet cover set', d: 'Printed, dyed or yarn-dyed.', p: [7.0, 16.0], u: 'set', photo: 'duvet-cover' },
      { n: 'Pillowcases', d: 'Housewife or Oxford style.', p: [0.8, 2.5], photo: 'pillowcases' },
      { n: 'Hotel white bedding', d: 'Percale 200–300 TC, high wash durability.', p: [6.5, 15.0], u: 'set', photo: 'hotel-bedding' },
      { n: 'Quilt / comforter', d: 'Microfibre or cotton shell with fill.', p: [8.0, 20.0], photo: 'comforter' },
    ],
    tables: [{ title: 'Fabrics', cols: ['Fabric', 'Thread count', 'Notes'], rows: [['Polycotton percale', '144–180', 'Easy care, budget'], ['Cotton percale', '180–300', 'Crisp, matte'], ['Cotton sateen', '250–400', 'Silky sheen'], ['Microfibre', '—', 'Brushed, budget'], ['Organic cotton', '180–300', 'GOTS programs']] }],
    sizes: 'Single, double, queen, king, super king (UK, EU, US sizes)', packing: [['Packing', 'PVC bag or printed box with insert card'], ['40 ft HC container', 'about 10,000–16,000 sets']], certs: ['OEKO-TEX Standard 100', 'GOTS', 'BCI'], tests: ['Thread count', 'Shrinkage', 'Colour fastness', 'Pilling'],
    config: { baseFrom: 'styles', groups: [{ name: 'Fabric', opts: [['Polycotton 144 TC', -0.8], ['Cotton percale 200 TC', 0], ['Cotton sateen 300 TC', 2.0]] }, { name: 'Packaging', opts: [['PVC bag', 0], ['Printed box', 0.6]] }, { name: 'Quantity', tiers: QTY_TIERS }] },
  },
  {
    id: 'kitchen', cat: 'home', name: 'Kitchen & table textiles', hs: '6302.91 · 6302.51',
    tag: 'Tea towels, aprons, oven mitts, pot holders, table cloths and napkins.',
    intro: 'Retail and food-service kitchen textiles in cotton, linen-look and terry, printed or yarn-dyed.',
    photo: 'tea-towels', moq: '2,000 pcs per design', lead: LEAD_WOVEN,
    styles: [
      { n: 'Tea towels', d: 'Waffle, terry or plain weave, 50×70 cm.', p: [0.6, 1.5], photo: 'tea-towels' },
      { n: 'Aprons', d: 'Bib aprons in canvas, twill or denim.', p: [1.5, 3.5], photo: 'apron' },
      { n: 'Oven mitts and pot holders', d: 'Heat-resistant padded.', p: [0.8, 2.2], photo: 'oven-mitt' },
      { n: 'Table cloths and napkins', d: 'Cotton, polycotton, linen-look.', p: [1.5, 6.0], photo: 'tablecloth' },
    ],
    tables: [{ title: 'Fabrics', cols: ['Fabric', 'Notes'], rows: [['Cotton waffle', 'Absorbent tea towels'], ['Cotton canvas / twill', 'Aprons'], ['Linen-cotton', 'Premium table linen'], ['Polycotton', 'Food-service, easy care']] }],
    sizes: 'To spec', packing: [['Packing', 'Banded sets or retail cards, 200–500 pcs per carton']], certs: ['OEKO-TEX Standard 100', 'BCI'], tests: ['Absorbency', 'Heat resistance (mitts)', 'Colour fastness'],
    config: { baseFrom: 'styles', groups: [{ name: 'Print', opts: [['Plain / dyed', 0], ['Printed', 0.15], ['Yarn-dyed check', 0.2]] }, { name: 'Quantity', tiers: QTY_TIERS }] },
  },

  /* =================== JUTE =================== */
  {
    id: 'jute-bags', cat: 'jute', name: 'Jute & juco bags', hs: '4202.92 · 6305.10',
    tag: 'Shopping totes, laminated bags, wine bags, gift pouches and jute-cotton (juco) bags.',
    intro: "Jute is Bangladesh's golden fibre: biodegradable, strong and a replacement for plastic bags. Diversified jute products earn far more per ton than traditional jute goods.",
    photo: 'jute-tote', moq: '1,000 pcs per design', lead: LEAD_JUTE,
    styles: [
      { n: 'Jute shopping tote', d: 'Natural or dyed hessian, rope or cotton handles.', p: [0.9, 2.5], photo: 'jute-tote' },
      { n: 'Laminated jute bag', d: 'PE-laminated inside, holds shape, wipeable.', p: [1.2, 2.8], photo: 'jute-laminated' },
      { n: 'Juco bag (jute-cotton)', d: 'Softer, prints sharper.', p: [1.1, 2.6], photo: 'juco-bag' },
      { n: 'Wine and bottle bags', d: '1, 2 or 4 bottle.', p: [0.7, 1.6], photo: 'wine-bag' },
      { n: 'Drawstring gift pouches', d: 'Small jute pouches for gifts and coffee samples.', p: [0.15, 0.45], photo: 'jute-pouch' },
    ],
    tables: [{ title: 'Fabric and finish options', cols: ['Option', 'Notes'], rows: [['Natural hessian 10–12 oz', 'Rustic look, most common'], ['Dyed hessian', 'Any Pantone'], ['Juco 50/50', 'Smooth, better print'], ['Lamination', 'PE inside for stiffness and water resistance'], ['Handles', 'Padded rope, cotton webbing, jute webbing, bamboo'], ['Printing', 'Screen print 1–4 colours']] }],
    sizes: 'To spec (e.g. 40×35×15 cm tote)', packing: [['Packing', 'Flat-packed, 100–200 pcs per bale or carton'], ['40 ft HC container', 'about 60,000–100,000 bags']], certs: ['Fumigation certificate when required', 'Azo-free dyes'], tests: ['Handle load test', 'Print rub', 'Size check'],
    config: { baseFrom: 'styles', groups: [{ name: 'Lamination', opts: [['None', 0], ['PE laminated', 0.25]] }, { name: 'Print', opts: [['Plain', 0], ['1 colour', 0.1], ['4 colours', 0.3]] }, { name: 'Quantity', tiers: [['1,000–2,999', 1.08], ['3,000–9,999', 1.0], ['10,000 +', 0.92]] }] },
  },
  {
    id: 'jute-industrial', cat: 'jute', name: 'Hessian, sacks, yarn & rope', hs: '5310.10 · 6305.10 · 5307.10 · 5607.90',
    tag: 'Hessian cloth, sacking bags for coffee, cocoa and grain, jute yarn, twine and rope.',
    intro: 'Traditional jute goods sell by weight to packaging, agriculture and carpet industries worldwide.',
    photo: 'hessian-sacks', moq: '5 t (cloth, sacks) · 3 t (rope, yarn)', lead: LEAD_JUTE,
    styles: [
      { n: 'Hessian sacks (B-twill / A-twill)', d: '50–100 kg sacks for grain, potato, coffee, cocoa.', p: [0.6, 1.2], photo: 'hessian-sacks' },
      { n: 'Food-grade sacks', d: 'Hydrocarbon-free (IJO standard) for coffee and cocoa.', p: [0.8, 1.5], photo: 'coffee-sacks' },
      { n: 'Hessian cloth', d: 'Rolls 36–72 in wide, 7–14 oz.', p: [1.5, 1.8], u: 'kg', photo: 'hessian-cloth', b: 'M' },
      { n: 'Jute yarn', d: '4–24 lbs/spy, CB, CRT and sacking grades.', p: [1.1, 1.6], u: 'kg', photo: 'jute-yarn' },
      { n: 'Jute twine and rope', d: 'Ply twine and 4–16 mm rope.', p: [1.5, 2.2], u: 'kg', photo: 'jute-rope' },
    ],
    tables: [{ title: 'Grades', cols: ['Product', 'Grades / specs'], rows: [['Sacking', 'B-twill, A-twill, L-twill; 600–1,000 g per bag'], ['Hessian', '7–14 oz per 40 in, 36–72 in widths'], ['Yarn', 'Sacking (SK), carpet backing (CB), CRT; 4–24 lbs/spy'], ['Batching oil', 'Standard or hydrocarbon-free (food grade)']] }],
    sizes: 'To spec', packing: [['Packing', 'Pressed bales 150–200 kg or rolls'], ['40 ft HC container', 'about 20–25 tonnes']], certs: ['IJO food-grade standard on request'], tests: ['Weight per bag / per yard', 'Moisture regain', 'Breaking strength'],
    config: { baseFrom: 'styles', groups: [{ name: 'Grade', opts: [['Standard', 0], ['Food grade (hydrocarbon-free)', 0.15]] }, { name: 'Quantity', tiers: KG_TIERS }] },
  },
  {
    id: 'jute-decor', cat: 'jute', name: 'Jute rugs & home decor', hs: '5702.39 · 4602.19 · 6304.99',
    tag: 'Braided rugs, runners, baskets, placemats, cushion covers and wall hangings.',
    intro: 'Handmade jute home decor from artisan groups across Bangladesh, popular with European, US and Australian home retailers.',
    photo: 'jute-rug', moq: '200 pcs per design', lead: LEAD_JUTE,
    styles: [
      { n: 'Braided jute rug', d: 'Round or rectangular, natural or bleached.', p: [4.0, 25.0], photo: 'jute-rug' },
      { n: 'Storage baskets', d: 'Nested sets with handles.', p: [2.0, 10.0], photo: 'jute-basket' },
      { n: 'Placemats and coasters', d: 'Round or square, sets of 4–6.', p: [0.4, 1.5], photo: 'placemats' },
      { n: 'Cushion covers', d: 'Jute or jute-cotton, embroidered or plain.', p: [1.5, 4.0], photo: 'cushion' },
      { n: 'Macramé wall hangings', d: 'Hand-knotted jute.', p: [3.0, 12.0], photo: 'macrame' },
    ],
    tables: [{ title: 'Options', cols: ['Option', 'Notes'], rows: [['Colours', 'Natural, bleached, dyed accents'], ['Backing', 'Anti-slip latex on rugs'], ['Labels', 'Your swing tag and barcode']] }],
    sizes: 'To spec', packing: [['Packing', 'Rolled or nested, cartons']], certs: ['Fumigation', 'Handmade / fair-trade groups on request'], tests: ['Size tolerance', 'Colour fastness'],
    config: { baseFrom: 'styles', groups: [{ name: 'Finish', opts: [['Natural', 0], ['Bleached or dyed', 0.4], ['Anti-slip backing (rugs)', 1.2]] }, { name: 'Quantity', tiers: [['200–499', 1.1], ['500–1,999', 1.0], ['2,000 +', 0.92]] }] },
  },

  /* =================== PRODUCE =================== */
  {
    id: 'vegetables', cat: 'produce', name: 'Fresh vegetables', hs: 'Chapter 07 (by item)',
    tag: 'More than 20 Bangladeshi vegetables for supermarkets, wholesalers and South Asian grocers.',
    intro: 'Bangladesh has exported 70+ vegetable varieties to 53 countries. Every lot is sorted, graded, residue-tested and shipped with a phytosanitary certificate. Prices are FOB per kg, packed; air or sea freight is quoted per shipment.',
    photo: 'potato', moq: '300–500 kg by air · one reefer container by sea', lead: LEAD_PRODUCE,
    styles: [
      { n: 'Potato (alu)', d: 'Diamant, Granola, Cardinal, Asterix. 25/50 kg mesh bags. Sea reefer.', p: [0.25, 0.4], u: 'kg', photo: 'potato', season: 'Jan–Sep', cal: [1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, 0, 0.5], peak: [1, 2, 3] },
      { n: 'Cabbage (bandhakopi)', d: 'Hybrid green heads 1–2 kg, mesh bags or cartons.', p: [0.3, 0.45], u: 'kg', photo: 'cabbage', season: 'Nov–Mar', cal: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1], peak: [12, 1, 2] },
      { n: 'Cauliflower (fulkopi)', d: 'White trimmed curds, 8–10 kg cartons.', p: [0.4, 0.6], u: 'kg', photo: 'cauliflower', season: 'Nov–Mar', cal: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1], peak: [12, 1] },
      { n: 'Bitter gourd (karala)', d: 'Dark green 15–20 cm, 5 kg cartons.', p: [0.9, 1.5], u: 'kg', photo: 'bitter-gourd', season: 'All year', cal: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], peak: [4, 5, 6] },
      { n: 'Pointed gourd (potol)', d: 'Uniform 8–12 cm, residue-controlled farms.', p: [0.9, 1.6], u: 'kg', photo: 'pointed-gourd', season: 'Mar–Oct', cal: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0], peak: [5, 6, 7] },
      { n: 'Teasel gourd (kakrol)', d: "Spiny gourd. Not offered to the EU (Bangladesh's own restriction).", p: [1.2, 2.0], u: 'kg', photo: 'teasel-gourd', season: 'May–Oct', cal: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0], peak: [6, 7, 8] },
      { n: 'Bottle gourd (lau)', d: 'Whole 1–2 kg, wrapped.', p: [0.4, 0.7], u: 'kg', photo: 'bottle-gourd', season: 'Most of the year', cal: [1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1], peak: [12, 1] },
      { n: 'Ridge and sponge gourd (jhinga, dhundul)', d: 'Tender 20–30 cm.', p: [0.8, 1.3], u: 'kg', photo: 'ridge-gourd', season: 'Apr–Oct', cal: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0], peak: [6, 7] },
      { n: 'Snake gourd (chichinga)', d: 'Long gourd, cut lengths in cartons.', p: [0.8, 1.3], u: 'kg', photo: 'snake-gourd', season: 'Apr–Oct', cal: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0], peak: [6, 7] },
      { n: 'Ash gourd (chal kumra)', d: 'Whole 3–6 kg.', p: [0.4, 0.7], u: 'kg', photo: 'ash-gourd', season: 'All year', cal: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], peak: [7, 8, 9] },
      { n: 'Sweet pumpkin (misti kumra)', d: 'Whole 2–5 kg, long shelf life.', p: [0.35, 0.6], u: 'kg', photo: 'pumpkin', season: 'Most of the year', cal: [1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 1, 1, 1, 1], peak: [12, 1, 2] },
      { n: 'Brinjal / eggplant (begun)', d: 'Long purple and round varieties.', p: [0.6, 1.1], u: 'kg', photo: 'brinjal', season: 'Most of the year', cal: [1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 1, 1, 1, 1], peak: [11, 12, 1] },
      { n: 'Green chili (kacha morich)', d: 'Fresh chilies, 2–5 kg cartons.', p: [1.2, 2.5], u: 'kg', photo: 'green-chili', season: 'All year', cal: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], peak: [12, 1, 2, 3] },
      { n: "Okra / lady's finger (dherosh)", d: 'Tender pods 8–12 cm.', p: [0.9, 1.5], u: 'kg', photo: 'okra', season: 'Mar–Oct', cal: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0], peak: [5, 6] },
      { n: 'Country bean / lablab (sheem)', d: 'Flat tender beans.', p: [0.9, 1.5], u: 'kg', photo: 'lablab', season: 'Nov–Mar', cal: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1], peak: [12, 1] },
      { n: 'Yard-long bean (borboti)', d: 'Bundled long beans.', p: [0.9, 1.5], u: 'kg', photo: 'long-beans', season: 'Apr–Oct', cal: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0], peak: [6, 7] },
      { n: 'Taro and taro stolon (kochu, kochur loti)', d: 'Corms and stolons.', p: [0.7, 1.4], u: 'kg', photo: 'taro', season: 'All year', cal: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], peak: [6, 7, 8] },
      { n: 'Leafy greens (lal shak, pui shak, kolmi)', d: 'Red amaranth, Indian spinach, kangkong. Air only.', p: [1.0, 2.0], u: 'kg', photo: 'leafy-greens', season: 'All year', cal: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], peak: [11, 12, 1] },
      { n: 'Radish (mula)', d: 'White radish, trimmed.', p: [0.3, 0.5], u: 'kg', photo: 'radish', season: 'Nov–Feb', cal: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], peak: [12, 1] },
      { n: 'Tomato', d: 'Firm, colour-graded.', p: [0.5, 0.9], u: 'kg', photo: 'tomato', season: 'Nov–Mar', cal: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1], peak: [1, 2] },
      { n: 'Carrot', d: 'Washed and graded.', p: [0.4, 0.7], u: 'kg', photo: 'carrot', season: 'Nov–Mar', cal: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1], peak: [1, 2] },
      { n: 'Betel leaf (paan)', d: 'Fresh leaves in moist wrap, salmonella-controlled.', p: [3.0, 6.0], u: 'kg', photo: 'betel', season: 'All year', cal: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], peak: [3, 4, 5] },
    ],
    tables: [
      { title: 'Grades and packing', cols: ['Item', 'Grade', 'Packing', 'Storage'], rows: [['Potato', 'Size 35–55 / 45–65 / 55–75 mm, no greening', '25 or 50 kg mesh bags', '2–4 °C reefer, months'], ['Cabbage, cauliflower', 'Head weight bands, trimmed', 'Mesh bags or 8–10 kg cartons', '0–2 °C, 2–4 weeks'], ['Gourds, okra, beans, chili', 'Length and colour graded, no blemish', '4–5 kg ventilated cartons', '8–12 °C, 1–2 weeks: air'], ['Leafy greens', 'Fresh bunches', '3–5 kg cartons with liner', 'Air only, 3–5 days'], ['Pumpkin, ash gourd', 'Whole, unbruised', 'Cartons or bulk bins', '10–13 °C, weeks']] },
      { title: 'Export compliance for every lot', cols: ['Step', 'Who'], rows: [['Contract farming with Good Agricultural Practice', 'Our farm partners'], ['Pesticide-residue lab test', 'Plant Quarantine laboratory, Chattogram / Dhaka'], ['Phytosanitary certificate', 'Plant Quarantine Wing, Department of Agricultural Extension'], ['Agro-product exporter licence', 'Department of Agricultural Marketing'], ['GlobalGAP certification', 'On request for EU and UK supermarket programs']] },
    ],
    sizes: '', packing: [['Air', 'Ventilated cartons on pallets, 300 kg–5 t per shipment'], ['40 ft reefer (potato)', 'about 26–28 t'], ['40 ft reefer (cabbage)', 'about 20–24 t']], certs: ['Phytosanitary certificate', 'Residue test report', 'GlobalGAP (on request)'], tests: ['Pesticide residue (MRL)', 'Pest-free inspection', 'Size, colour and defect grading'],
    config: { baseFrom: 'styles', groups: [{ name: 'Packing', opts: [['Standard bags / cartons', 0], ['Retail pre-pack with labels', 0.15]] }, { name: 'Grade', opts: [['Grade A', 0], ['Premium sorted', 0.08]] }, { name: 'Quantity', tiers: KG_TIERS }] },
  },
  {
    id: 'fruits', cat: 'produce', name: 'Fresh fruits', hs: 'Chapter 08 (by item)',
    tag: 'Mango, jackfruit, guava, litchi, pineapple, lemon, satkora and green coconut.',
    intro: 'Fruit exports reached a record of over $123 million in FY2025-26, led by mango for buyers across the Gulf, UK and Europe. Mangoes ship after hot-water or vapour heat treatment.',
    photo: 'mango', moq: '500 kg by air', lead: LEAD_PRODUCE,
    styles: [
      { n: 'Mango (aam)', d: 'Himsagar, Langra, Amrapali, Fazli, Haribhanga. 5 kg cartons.', p: [1.2, 2.5], u: 'kg', photo: 'mango', season: 'May–Aug', cal: [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0], peak: [6, 7] },
      { n: 'Jackfruit (kathal)', d: "Whole fruits 5–15 kg; Bangladesh's national fruit.", p: [0.5, 1.0], u: 'kg', photo: 'jackfruit', season: 'Mar–Jul', cal: [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0], peak: [5, 6] },
      { n: 'Guava (peyara)', d: 'Thai and local varieties in foam nets.', p: [0.8, 1.4], u: 'kg', photo: 'guava', season: 'Two crops a year', cal: [1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], peak: [8, 9, 12] },
      { n: 'Litchi (lichu)', d: 'Bombai and China-3 varieties, short season.', p: [2.5, 4.5], u: 'kg', photo: 'litchi', season: 'May–Jun', cal: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0], peak: [5, 6] },
      { n: 'Pineapple (anaras)', d: 'Honey Queen and Giant Kew.', p: [0.5, 0.9], u: 'kg', photo: 'pineapple', season: 'Apr–Sep', cal: [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0], peak: [6, 7] },
      { n: 'Lemon and lime (lebu)', d: 'Kagzi and seedless lemon.', p: [0.8, 1.5], u: 'kg', photo: 'lemon', season: 'All year', cal: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], peak: [6, 7, 8] },
      { n: 'Satkora (Sylhet citrus)', d: 'Aromatic citrus loved by the Sylheti diaspora in the UK.', p: [2.0, 4.0], u: 'kg', photo: 'satkora', season: 'Jul–Nov', cal: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0], peak: [8, 9] },
      { n: 'Green coconut (dab)', d: 'Tender coconuts, trimmed.', p: [0.4, 0.8], photo: 'coconut', season: 'All year', cal: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], peak: [4, 5, 6] },
    ],
    tables: [{ title: 'Treatment and packing', cols: ['Fruit', 'Treatment', 'Packing'], rows: [['Mango', 'Hot-water treatment or vapour heat treatment, fruit-fly control', '5 kg ventilated cartons, foam nets'], ['Litchi', 'Fast cold chain, sulphur-free on request', '2–5 kg cartons'], ['Jackfruit', 'Whole, wrapped', 'Individual net or carton'], ['Citrus', 'Washed, waxed on request', '5–10 kg cartons']] }],
    sizes: '', packing: [['Air', 'Cartons on pallets'], ['40 ft reefer', 'about 18–22 t (mango, sea trial programs)']], certs: ['Phytosanitary certificate', 'Treatment certificate', 'GlobalGAP on request'], tests: ['Residue test', 'Brix and maturity check', 'Pest inspection'],
    config: { baseFrom: 'styles', groups: [{ name: 'Packing', opts: [['Standard cartons', 0], ['Retail punnets / net bags', 0.2]] }, { name: 'Quantity', tiers: KG_TIERS }] },
  },

  /* =================== FOOD =================== */
  {
    id: 'spices', cat: 'food', name: 'Spices & masalas', hs: '0910.30 · 0904.22 · 0909.22 · 0910.91',
    tag: 'Turmeric, chili and coriander powders, mixed masalas and whole spices.',
    intro: 'Ground spices and ready masala blends for retail and food service, in bulk or private-label packs. Each batch is lab tested.',
    photo: 'turmeric-powder', moq: '1 t per product (500 kg for blends)', lead: LEAD_FOOD,
    styles: [
      { n: 'Turmeric powder', d: 'Curcumin 2.5–4%, bulk or retail packs.', p: [2.5, 4.5], u: 'kg', photo: 'turmeric-powder' },
      { n: 'Red chili powder', d: 'Hot or Kashmiri-style colour grades.', p: [2.8, 4.8], u: 'kg', photo: 'chili-powder' },
      { n: 'Coriander powder', d: 'Fresh-ground, aromatic.', p: [2.2, 3.8], u: 'kg', photo: 'coriander-powder' },
      { n: 'Biryani and meat masala', d: 'Ready blends for South Asian cooking.', p: [4.0, 7.0], u: 'kg', photo: 'masala' },
      { n: 'Panch phoron and whole spices', d: 'Bengali five-spice and whole spice packs.', p: [3.5, 6.5], u: 'kg', photo: 'whole-spices' },
    ],
    tables: [{ title: 'Packing', cols: ['Format', 'Sizes'], rows: [['Retail pouches', '50 g, 100 g, 200 g, 500 g, 1 kg'], ['Jars', '100–400 g'], ['Bulk', '10–25 kg bags in cartons']] }],
    sizes: '', packing: [['40 ft HC container', 'about 12–16 t (retail packs)']], certs: ['Halal', 'BSTI', 'HACCP / ISO 22000 on request'], tests: ['Aflatoxin', 'Pesticide residue', 'Moisture', 'Colour value / curcumin'],
    config: { baseFrom: 'styles', groups: [{ name: 'Packing', opts: [['Bulk 25 kg', 0], ['Retail pouches', 0.6], ['Jars', 1.1]] }, { name: 'Quantity', tiers: KG_TIERS }] },
  },
  {
    id: 'grocery', cat: 'food', name: 'Rice, tea, oil & grocery', hs: '1006.30 · 0902.40 · 1514.91 · 1904.10',
    tag: 'Aromatic rice, Sylhet tea, mustard oil, puffed and flattened rice, pickles, biscuits and honey.',
    intro: 'Bangladeshi pantry staples for the diaspora and for mainstream retailers. Aromatic rice exports need a government quota, which we arrange.',
    photo: 'aromatic-rice', moq: '1–2 t per product (mixed containers welcome)', lead: LEAD_FOOD,
    styles: [
      { n: 'Aromatic rice (Chinigura, Kalijira)', d: 'Small-grain fragrant rice; export under Commerce Ministry quota.', p: [1.6, 2.6], u: 'kg', photo: 'aromatic-rice' },
      { n: 'Black tea (Sylhet)', d: 'CTC and orthodox leaf tea, bulk or bags.', p: [2.5, 5.0], u: 'kg', photo: 'tea' },
      { n: 'Mustard oil', d: 'Kacchi ghani cold-pressed, 500 ml–5 L.', p: [2.2, 3.5], u: 'litre', photo: 'mustard-oil' },
      { n: 'Puffed and flattened rice (muri, chira)', d: 'Retail packs or bulk.', p: [1.2, 2.2], u: 'kg', photo: 'puffed-rice' },
      { n: 'Pickles (achar)', d: 'Mango, olive, mixed, chili.', p: [2.0, 4.0], u: 'kg', photo: 'pickles' },
      { n: 'Biscuits and snacks', d: 'Toast, cookies, chanachur.', p: [1.5, 3.5], u: 'kg', photo: 'biscuits' },
      { n: 'Honey (Sundarbans and mustard)', d: 'Raw and filtered honey.', p: [4.0, 8.0], u: 'kg', photo: 'honey' },
    ],
    tables: [{ title: 'Export rules', cols: ['Product', 'Rule'], rows: [['Aromatic rice', 'Export only within the government quota; non-aromatic rice cannot be exported'], ['Onion, garlic, ginger, raw pulses', 'Not exportable from Bangladesh'], ['Honey', 'Lab test for adulteration and residues']] }],
    sizes: '', packing: [['40 ft HC container', 'about 20–24 t (rice) or mixed grocery']], certs: ['Halal', 'BSTI', 'HACCP on request'], tests: ['Moisture, broken grains (rice)', 'Residue and aflatoxin', 'Purity (honey, oil)'],
    config: { baseFrom: 'styles', groups: [{ name: 'Packing', opts: [['Bulk', 0], ['Retail packs', 0.4]] }, { name: 'Quantity', tiers: KG_TIERS }] },
  },
  {
    id: 'frozen', cat: 'food', name: 'Frozen fish, shrimp & foods', hs: '0306.17 · 0303.89 · 1905.90',
    tag: 'Black tiger and freshwater prawns, rohu, hilsa, and frozen paratha and snacks.',
    intro: 'Frozen fish and shrimp ship at −18 °C under a Fish Inspection and Quality Control (FIQC) licence and health certificate.',
    photo: 'black-tiger-shrimp', moq: 'One 20 ft or 40 ft reefer (mixed loads possible)', lead: [['Specification and order', 3, 5], ['Procurement and processing', 7, 15], ['Freezing and FIQC health certificate', 3, 5], ['Reefer loading', 1, 2]],
    styles: [
      { n: 'Black tiger shrimp (bagda)', d: 'HOSO, HLSO, PD, PUD; sizes 8/12 to 31/40 per lb.', p: [8.0, 16.0], u: 'kg', photo: 'black-tiger-shrimp' },
      { n: 'Freshwater prawn (golda)', d: 'Macrobrachium, head-on; 61/70 count and larger only.', p: [7.0, 14.0], u: 'kg', photo: 'freshwater-prawn' },
      { n: 'Rohu, katla and pangas fish', d: 'Whole, steaks or fillets.', p: [2.0, 4.0], u: 'kg', photo: 'rohu' },
      { n: 'Hilsa (ilish)', d: 'Whole frozen, seasonal and quota-dependent.', p: [9.0, 16.0], u: 'kg', photo: 'hilsa' },
      { n: 'Frozen paratha', d: 'Plain, onion and lachha paratha.', p: [1.8, 3.5], u: 'kg', photo: 'paratha' },
      { n: 'Frozen snacks', d: 'Samosa, singara, spring rolls.', p: [2.5, 4.5], u: 'kg', photo: 'samosa' },
    ],
    tables: [{ title: 'Shrimp presentations', cols: ['Code', 'Meaning'], rows: [['HOSO', 'Head-on shell-on'], ['HLSO', 'Headless shell-on'], ['PD / PUD', 'Peeled deveined / peeled undeveined'], ['PDTO', 'Peeled deveined tail-on'], ['Block / IQF', 'Block-frozen or individually quick frozen'], ['Glaze', 'Ice glaze 10–20% declared']] }],
    sizes: 'Shrimp count per lb as specified', packing: [['Packing', '1–2 kg inner boxes, 10–20 kg master cartons'], ['40 ft reefer', 'about 22–26 t']], certs: ['FIQC licence and health certificate', 'Halal', 'HACCP', 'BRC / ASC on request'], tests: ['Microbiology', 'Antibiotic residues', 'Glaze and net weight', 'Temperature log'],
    config: { baseFrom: 'styles', groups: [{ name: 'Freezing', opts: [['Block frozen', 0], ['IQF', 0.6]] }, { name: 'Quantity', tiers: [['20 ft reefer', 1.03], ['40 ft reefer', 1.0]] }] },
  },

  /* =================== CRAFTS =================== */
  {
    id: 'handicrafts', cat: 'crafts', name: 'Handicrafts & handloom', hs: '6304.19 · 4602.19 · 6913.90 · 5007.20',
    tag: 'Nakshi kantha, jamdani, gamcha, seagrass, cane, bamboo and terracotta.',
    intro: 'Handmade products from artisan groups across Bangladesh, named a priority export in the Export Policy 2024-27. Each piece is slightly unique.',
    photo: 'nakshi-kantha', moq: '50–200 pcs per design', lead: [['Sample', 10, 15], ['Artisan production', 20, 45], ['Quality check and packing', 3, 5]],
    styles: [
      { n: 'Nakshi kantha', d: 'Hand-stitched embroidered quilts and throws.', p: [18.0, 60.0], photo: 'nakshi-kantha' },
      { n: 'Jamdani and handloom textiles', d: 'Jamdani sarees and stoles; UNESCO-listed weaving tradition.', p: [25.0, 150.0], photo: 'jamdani' },
      { n: 'Gamcha and handloom towels', d: 'Checked cotton handloom.', p: [0.8, 2.0], photo: 'gamcha' },
      { n: 'Seagrass and kaisa baskets', d: 'Storage, planters, hampers.', p: [2.0, 12.0], photo: 'seagrass-basket' },
      { n: 'Cane and bamboo products', d: 'Trays, lamps, furniture, kitchenware.', p: [1.5, 40.0], photo: 'bamboo-craft' },
      { n: 'Terracotta', d: 'Pots, planters, tableware, wall tiles.', p: [1.5, 15.0], photo: 'terracotta' },
    ],
    tables: [{ title: 'Options', cols: ['Option', 'Notes'], rows: [['Colours and sizes', 'Matched to your range; small variations are natural'], ['Labels', 'Your swing tags, barcodes and story cards'], ['Fair trade', 'Artisan groups with fair-trade practices on request']] }],
    sizes: 'To spec', packing: [['Packing', 'Nested or individually wrapped, cartons']], certs: ['Fumigation (natural fibre)', 'Fair-trade groups on request'], tests: ['Size and colour check', 'Lead-free glaze (terracotta tableware)'],
    config: { baseFrom: 'styles', groups: [{ name: 'Packaging', opts: [['Standard', 0], ['Gift box with story card', 1.0]] }, { name: 'Quantity', tiers: [['50–199', 1.12], ['200–999', 1.0], ['1,000 +', 0.92]] }] },
  },
]

export const familyById = (id: string) => FAMILIES.find((f) => f.id === id)
export const catById = (id: string) => CATS.find((c) => c.id === id)
export const unitOf = (u?: string) => u ?? 'pc'

import { slug as _slug } from '@/lib/slug'
export const itemId = (n: string) => _slug(n)
export const findItem = (familyId: string, id: string) => {
  const f = familyById(familyId)
  const s = f?.styles.find((x) => _slug(x.n) === id)
  return f && s ? { f, s } : undefined
}
export const ALL_ITEMS = FAMILIES.flatMap((f) => f.styles.map((s) => ({ f, s })))
