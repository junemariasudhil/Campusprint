import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Pill({ active, className, children, ...rest }: PillProps) {
  return (
    <button
      type="button"
      className={cn(
        'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors',
        active
          ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20'
          : 'bg-white text-slate-600 border border-orange-100 hover:border-orange-300',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
