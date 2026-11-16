import type { CSSProperties } from 'react'

const VARS: Record<string, string> = {
  garments: '--c-garments', produce: '--c-produce', footwear: '--c-footwear', food: '--c-food', home: '--c-home', jute: '--c-jute', crafts: '--c-crafts',
}

/** Inline style that sets the category colour as --c, for .cat-bg / .cat-soft / .cat-text helpers. */
export const catStyle = (cat: string) => ({ ['--c' as string]: `var(${VARS[cat] ?? '--brand'})` }) as CSSProperties

export const CAT_PHOTO: Record<string, string> = {
  garments: 'tshirt-crew', footwear: 'slides', home: 'bath-towels', jute: 'jute-tote', produce: 'mango', food: 'turmeric-powder', crafts: 'seagrass-basket',
}
