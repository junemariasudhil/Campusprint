import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin text-orange-500', className)} />
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
