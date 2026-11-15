import { useSyncExternalStore } from 'react'

export interface BasketItem {
  key: string
  familyId: string
  family: string
  style: string
  itemId?: string
  qty?: string
  spec?: string
  estimate?: string
  /** Numbers for the basket total */
  unitMid?: number
  qtyNum?: number
  unit?: string
}

const KEY = 'bde-quote-basket-v2'
let items: BasketItem[] = []
let loaded = false
const listeners = new Set<() => void>()
const EMPTY: BasketItem[] = []

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) items = JSON.parse(raw) as BasketItem[]
  } catch {
    items = []
  }
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    /* storage unavailable: keep in memory */
  }
  listeners.forEach((l) => l())
}

export const basket = {
  /** Adds an item; the same product with the same spec replaces its earlier entry (so quantity updates). */
  add(item: Omit<BasketItem, 'key'>) {
    load()
    const key = `${item.familyId}|${item.style}|${item.spec ?? ''}`
    items = [...items.filter((i) => i.key !== key), { ...item, key }]
    save()
  },
  remove(key: string) {
    load()
    items = items.filter((i) => i.key !== key)
    save()
  },
  clear() {
    items = []
    save()
  },
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useBasket(): BasketItem[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      load()
      return items
    },
    () => EMPTY,
  )
}
