import { FileText, Sparkles, User } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { PrintRequest, RequestStatus } from '@/types'

const NEXT_ACTION: Partial<Record<RequestStatus, { label: string; next: RequestStatus }>> = {
  QUEUED: { label: 'Start printing', next: 'PRINTING' },
  PRINTING: { label: 'Mark ready for pickup', next: 'READY' },
  READY: { label: 'Mark completed', next: 'COMPLETED' },
  CANCELLATION_PENDING: { label: 'Confirm cancellation', next: 'CANCELLED' },
}

const CONFIG_SUMMARY = (r: PrintRequest) =>
  [
    r.colour_mode === 'BW' ? 'B/W' : 'Colour',
    r.sides === 'SINGLE' ? 'Single-sided' : 'Double-sided',
    r.stapling === 'STAPLE' ? 'Stapled' : null,
    r.binding !== 'NONE' ? (r.binding === 'SOFT_SPIRAL' ? 'Soft spiral' : 'Hard spiral') : null,
  ]
    .filter(Boolean)
    .join(' · ')

export function ShopRequestCard({
  request,
  onAdvance,
}: {
  request: PrintRequest
  onAdvance: (id: string, next: RequestStatus) => void
}) {
  const action = NEXT_ACTION[request.request_status]

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold tracking-wide text-slate-500">
                {request.request_id}
              </span>
              {request.priority && (
                <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                  <Sparkles className="h-3 w-3" /> Priority
                </span>
              )}
            </div>
            <p className="mt-1 font-semibold text-slate-800">{request.document_name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
              <User className="h-3 w-3" />
              {request.profiles?.full_name || request.profiles?.email || 'Student'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {request.page_count} pages × {request.copies} {request.copies === 1 ? 'copy' : 'copies'} · {CONFIG_SUMMARY(request)}
            </p>
            {request.comments && <p className="mt-1 text-xs italic text-slate-400">"{request.comments}"</p>}
          </div>
        </div>
        <StatusBadge status={request.request_status} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-orange-100/60 pt-3">
        <div className="text-xs text-slate-400">
          <p>Pickup {request.preferred_pickup_start} – {request.preferred_pickup_end}</p>
          <p className="mt-0.5">{formatDateTime(request.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800">{formatCurrency(request.total_price)}</span>
          {action && (
            <Button size="md" className="px-3 py-1.5 text-xs" onClick={() => onAdvance(request.id, action.next)}>
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
