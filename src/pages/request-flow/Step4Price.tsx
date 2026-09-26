import { useEffect, useState } from 'react'
import { ListOrdered } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/lib/utils'
import { estimateQueuePosition } from '@/services/requestService'
import type { PriceBreakdown } from '@/types'
import type { StepProps } from './types'

export function Step4Price({
  draft,
  pricing,
  onNext,
  onBack,
}: StepProps & { pricing: PriceBreakdown; onNext: () => void; onBack: () => void }) {
  const [queuePosition, setQueuePosition] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    estimateQueuePosition(draft.printShopId, draft.preferredPickupStart, draft.priority)
      .then((pos) => {
        if (!cancelled) setQueuePosition(pos)
      })
      .catch(() => {
        if (!cancelled) setQueuePosition(null)
      })
    return () => {
      cancelled = true
    }
  }, [draft.printShopId, draft.preferredPickupStart, draft.priority])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Price breakdown</h2>
        <p className="text-sm text-slate-400">Calculated from live print shop rates.</p>
      </div>

      <Card className="p-5">
        <Row label={`Base cost (${draft.pageCount} pages × ${draft.copies} ${draft.copies === 1 ? 'copy' : 'copies'})`} value={pricing.basePrice} />
        <Row label="Finishing (stapling / binding)" value={pricing.finishingPrice} />
        {draft.priority && <Row label="Priority fee (+10%)" value={pricing.priorityFee} />}
        <div className="mt-3 flex items-center justify-between border-t border-orange-100/60 pt-3">
          <span className="font-bold text-slate-800">Total</span>
          <span className="text-xl font-bold text-orange-600">{formatCurrency(pricing.totalPrice)}</span>
        </div>
      </Card>

      <Card className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ListOrdered className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {queuePosition === null ? <Spinner className="h-4 w-4" /> : `Estimated queue position: #${queuePosition}`}
          </p>
          <p className="text-xs text-slate-400">Based on current queue for this shop and pickup slot</p>
        </div>
      </Card>

      <div className="mt-2 flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" fullWidth onClick={onNext}>
          Continue to payment
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-700">{formatCurrency(value)}</span>
    </div>
  )
}
