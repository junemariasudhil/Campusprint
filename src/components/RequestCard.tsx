import { FileText, MapPin, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { canCancelRequest } from '@/services/requestService'
import type { PrintRequest } from '@/types'

export function RequestCard({
  request,
  onCancel,
}: {
  request: PrintRequest
  onCancel: (request: PrintRequest) => void
}) {
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
              <MapPin className="h-3 w-3" />
              {request.print_shops?.name ?? 'Print shop'}
            </p>
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
          {canCancelRequest(request.request_status) && (
            <Button variant="danger" size="md" className="px-3 py-1.5 text-xs" onClick={() => onCancel(request)}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
