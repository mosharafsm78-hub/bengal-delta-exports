import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from '@/components/not-found'

export const Route = createFileRoute('/not-found')({
  head: () => ({ meta: [{ title: 'Page not found — Bengal Delta Exports' }, { name: 'robots', content: 'noindex' }] }),
  component: NotFound,
})
