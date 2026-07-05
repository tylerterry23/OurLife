import { cn } from '@/lib/utils'

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-2xl',
  xl: 'h-20 w-20 text-3xl',
}

export function Avatar({
  url,
  name,
  size = 'md',
  className,
}: {
  url?: string | null
  name?: string | null
  size?: keyof typeof sizes
  className?: string
}) {
  const initial = (name ?? '').trim().charAt(0).toUpperCase() || '?'
  const base = cn(
    'shrink-0 rounded-full ring-2 ring-ink-raised',
    sizes[size],
    className
  )

  if (url) {
    return <img src={url} alt="" className={cn(base, 'object-cover')} />
  }

  return (
    <div
      className={cn(
        base,
        'flex items-center justify-center bg-wine font-display text-parchment'
      )}
    >
      {initial}
    </div>
  )
}
