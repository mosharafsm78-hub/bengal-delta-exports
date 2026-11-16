import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { useHydrated } from '@/lib/use-hydrated'
import { pageHead } from '@/lib/head'

const BuyerApp = lazy(() => import('@/buyer/BuyerApp').then((m) => ({ default: m.BuyerApp })))

export const Route = createFileRoute('/account')({
  head: () => pageHead('/account', { title: 'Free buyer account: your own sourcing agent in Bangladesh | BengalExport', description: 'Create a free BengalExport buyer account. Get the Verified buyer badge, a personal sourcing agent, offers in 24 hours and live tracking for every order.' }),
  component: Account,
})

function Account() {
  const hydrated = useHydrated()
  const wait = <div className="grid min-h-[60vh] place-items-center text-muted-foreground">Loading…</div>
  return hydrated ? <Suspense fallback={wait}><BuyerApp /></Suspense> : wait
}
