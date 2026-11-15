export type CategoryId = 'garments' | 'footwear' | 'home' | 'jute' | 'produce' | 'food' | 'crafts'

export interface Category {
  id: CategoryId
  name: string
  short: string
  blurb: string
}

/** One sellable type inside a product family, e.g. "V-neck tee". */
export interface Style {
  n: string
  d: string
  /** Indicative FOB price range in USD per unit */
  p: [number, number]
  /** Unit; defaults to "pc" */
  u?: string
  photo: string
  /** "M" = based on published Bangladeshi supplier prices; otherwise our estimate */
  b?: 'M'
  season?: string
  /** 12 values (Jan–Dec): 1 available, 0.5 limited, 0 none */
  cal?: number[]
  /** Peak months, 1–12 */
  peak?: number[]
}

export interface InfoTable {
  title: string
  cols: string[]
  rows: string[][]
}

export interface ConfigGroup {
  name: string
  /** [label, added USD per unit] */
  opts?: [string, number][]
  /** [label, price multiplier] */
  tiers?: [string, number][]
}

export interface Family {
  id: string
  cat: CategoryId
  name: string
  hs: string
  tag: string
  intro: string
  photo: string
  moq: string
  /** [stage, min days, max days] */
  lead: [string, number, number][]
  styles: Style[]
  tables: InfoTable[]
  sizes: string
  packing: [string, string][]
  certs: string[]
  tests: string[]
  config: { baseFrom: 'styles'; groups: ConfigGroup[] }
}
