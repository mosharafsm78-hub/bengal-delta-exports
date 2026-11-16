import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { useHydrated } from '@/lib/use-hydrated'

const AdminApp = lazy(() => import('@/admin/AdminApp').then((m) => ({ default: m.AdminApp })))

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Admin — BengalExport' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: Admin,
})

function Admin() {
  const hydrated = useHydrated()
  if (!hydrated) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>}>
      <AdminApp />
    </Suspense>
  )
}
