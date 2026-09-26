import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-white border border-orange-100/50 shadow-xl shadow-orange-500/5',
        className,
      )}
      {...rest}
    />
  )
}
