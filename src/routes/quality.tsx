import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { pageHead } from '@/lib/head'
import { PageHead } from '@/components/site-shell'

export const Route = createFileRoute('/quality')({
  head: () => pageHead('/quality'),
  component: Quality,
})

const BLOCKS: [string, string[]][] = [
  ['Fresh produce', ['Sourced from contract farms that follow Good Agricultural Practice', 'Pesticide-residue lab test before shipment; the Plant Quarantine station refuses lots over international limits', 'Phytosanitary certificate from the Department of Agricultural Extension for every consignment', 'Sorted, graded, washed and packed in ventilated cartons, cold-chained to the aircraft or reefer']],
  ['Garments and home textiles', ['Partner factories with BSCI, OEKO-TEX, GOTS or WRAP certificates, shown per factory on request', 'AQL 2.5 final inspection; third-party inspection (SGS, Intertek, Bureau Veritas) at your choice', 'Lab tests for shrinkage, colour fastness, pilling and GSM']],
  ['Footwear and leather', ['Produced in verified partner factories, with in-line and final inspection by our QC team', 'Sole bonding, flex and colour-fastness checks; REACH and CPSIA chemical tests on request', 'Size-set and shipment samples approved by you before bulk']],
  ['Food and spices', ['Halal certificates and BSTI or Bangladesh Food Safety Authority compliance', 'Aflatoxin, residue and moisture tests per batch', 'Batch codes, best-before dates and labels in your market language']],
  ['Frozen fish and shrimp', ['Fish Inspection and Quality Control (FIQC) licence and health certificate', 'Antibiotic residue and microbiology tests', 'Temperature log from freezing to loading at −18 °C']],
  ['Jute and handicrafts', ['Moisture and weight checks on jute goods', 'Fumigation certificate for natural-fibre items when required', 'Lead-free glaze checks on terracotta tableware']],
]

function Quality() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12">
      <PageHead eyebrow="Quality and compliance" title="Checked before it leaves Bangladesh" lead="Every shipment passes our inspection and the government checks for its product type. Rejected goods cost everyone, so we test first." />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {BLOCKS.map(([t, list]) => (
          <div key={t} className="rounded-lg border border-border bg-card p-7">
            <h2 className="mt-0 mb-4 text-xl">{t}</h2>
            <ul className="m-0 grid list-none gap-2.5 p-0 text-[15px]">{list.map((l) => <li key={l} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 flex-none text-ok" aria-hidden="true" />{l}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-border bg-card p-7">
        <h2 className="mt-0 mb-2 text-xl">Paperwork you can trust</h2>
        <p className="m-0 text-[15px] text-muted-foreground">Every certificate comes from the official authority, and originals go to your bank with the shipping documents.</p>
      </div>
    </div>
  )
}
