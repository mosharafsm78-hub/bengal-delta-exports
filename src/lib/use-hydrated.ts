import { useEffect, useState } from 'react'

/** False during the first render (which must match the prerendered HTML), true right after. */
export function useHydrated() {
  const [h, setH] = useState(false)
  useEffect(() => setH(true), [])
  return h
}
