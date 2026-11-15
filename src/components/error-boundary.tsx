import type { ErrorComponentProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

export function ErrorBoundary({ reset }: ErrorComponentProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-3xl">Something went wrong on this page.</h1>
      <p className="mt-3 text-muted-foreground">Please try again. If it keeps happening, email us and we'll help directly.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={reset} className="rounded-md bg-brand px-5 py-3 font-semibold text-brand-ink">Try again</button>
        <Link to="/" className="rounded-md border border-border px-5 py-3 font-semibold text-foreground no-underline">Home</Link>
      </div>
    </div>
  )
}
