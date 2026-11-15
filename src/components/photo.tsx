import { PHOTOS } from '@/data/photos'
import { cn } from '@/lib/utils'

export function Photo({ id, alt, className, credit = false, eager = false }: { id: string; alt: string; className?: string; credit?: boolean; eager?: boolean }) {
  const p = PHOTOS[id]
  if (!p) {
    return (
      <div className={cn('flex items-center justify-center bg-brand-soft p-4 text-center text-sm font-semibold text-brand', className)} role="img" aria-label={alt}>
        {alt}
      </div>
    )
  }
  return (
    <figure className={cn('relative m-0 overflow-hidden bg-muted', className)}>
      <img src={p.src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover" />
      {credit && (
        <figcaption className="absolute right-0 bottom-0 max-w-full truncate bg-ink/55 px-2 py-0.5 text-[10px] text-paper">
          <a href={p.page} target="_blank" rel="noopener noreferrer" className="text-paper no-underline hover:underline">
            Photo: {p.credit}
          </a>
        </figcaption>
      )}
    </figure>
  )
}
