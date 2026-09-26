import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 disabled:opacity-50',
  secondary:
    'bg-white text-slate-700 border border-orange-100 shadow-sm hover:border-orange-300 disabled:opacity-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-orange-50 disabled:opacity-50',
  danger:
    'bg-white text-red-500 border border-red-200 hover:bg-red-50 disabled:opacity-50',
}

const sizeStyles: Record<Size, string> = {
  md: 'px-4 py-2.5 text-sm rounded-2xl',
  lg: 'px-6 py-3.5 text-base rounded-2xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
