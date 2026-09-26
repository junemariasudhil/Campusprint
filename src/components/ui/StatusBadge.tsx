import { cn } from '@/lib/utils'
import type { RequestStatus } from '@/types'

const STATUS_META: Record<RequestStatus, { label: string; className: string }> = {
  PAYMENT_PENDING: { label: 'Payment pending', className: 'bg-amber-50 text-amber-600' },
  QUEUED: { label: 'Queued', className: 'bg-blue-50 text-blue-600' },
  CANCELLATION_PENDING: { label: 'Cancellation pending', className: 'bg-amber-50 text-amber-600' },
  LOCKED: { label: 'Locked', className: 'bg-slate-100 text-slate-600' },
  PRINTING: { label: 'Printing', className: 'bg-indigo-50 text-indigo-600' },
  READY: { label: 'Ready for pickup', className: 'bg-green-50 text-green-600' },
  COMPLETED: { label: 'Completed', className: 'bg-slate-100 text-slate-500' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-50 text-red-500' },
  REFUND_PENDING: { label: 'Refund pending', className: 'bg-amber-50 text-amber-600' },
  REFUNDED: { label: 'Refunded', className: 'bg-slate-100 text-slate-500' },
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', meta.className)}>
      {meta.label}
    </span>
  )
}
