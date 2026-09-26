import { cn } from '@/lib/utils'

const LABELS = ['Upload', 'Configure', 'Shop', 'Price', 'Pay']

export function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-6 flex items-center gap-1.5">
      {LABELS.map((label, i) => {
        const n = i + 1
        const state = n < step ? 'done' : n === step ? 'active' : 'upcoming'
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={cn(
                'h-1.5 w-full rounded-full',
                state === 'upcoming' ? 'bg-orange-100' : 'bg-gradient-to-r from-orange-500 to-amber-400',
              )}
            />
            <span
              className={cn(
                'text-[10px] font-semibold',
                state === 'upcoming' ? 'text-slate-300' : 'text-orange-600',
              )}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
