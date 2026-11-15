import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="eyebrow mb-3">Page not found</div>
      <h1 className="text-4xl">We couldn't find that page.</h1>
      <p className="mt-4 text-muted-foreground">It may have moved. Browse the catalogue or tell us what you're looking for.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/products" className="rounded-md bg-brand px-5 py-3 font-semibold text-brand-ink no-underline">Browse products</Link>
        <Link to="/quote" search={{ tab: 'requirement' }} className="rounded-md border border-brand px-5 py-3 font-semibold text-brand no-underline">Send a requirement</Link>
      </div>
    </div>
  )
}
