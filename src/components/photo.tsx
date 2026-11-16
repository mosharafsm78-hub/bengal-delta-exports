import { PHOTOS, SAMPLE } from '@/data/photos'
import { cn } from '@/lib/utils'

export function Photo({ id, alt, className, credit = false, eager = false, tag = false }: { id: string; alt: string; className?: string; credit?: boolean; eager?: boolean; tag?: boolean }) {
  const p = PHOTOS[id]
  if (!p) {
    return (
      <div className={cn('flex items-center justify-center bg-brand-soft p-4 text-center text-sm font-semibold text-brand', className)} role="img" aria-label={alt}>
        {alt}
      </div>
    )
  }
  const sample = p.license === SAMPLE
  return (
    <figure className={cn('relative m-0 overflow-hidden bg-muted', className)}>
      <img src={p.src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover" />
      {sample && (tag || credit) && (
        <figcaption className="absolute bottom-2 left-2 rounded-full bg-ink/60 px-2.5 py-0.5 text-[11px] font-medium text-paper">
          Sample image
        </figcaption>
      )}
      {!sample && credit && (
        <figcaption className="absolute right-0 bottom-0 max-w-full truncate bg-ink/55 px-2 py-0.5 text-[10px] text-paper">
          <a href={p.page} target="_blank" rel="noopener noreferrer" className="text-paper no-underline hover:underline">
            Photo: {p.credit}
          </a>
        </figcaption>
      )}
    </figure>
  )
}
