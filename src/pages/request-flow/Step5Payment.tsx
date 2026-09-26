import { useState } from 'react'
import { CircleCheck, CircleX, CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { uploadDocument } from '@/services/storageService'
import { createPrintRequest } from '@/services/requestService'
import type { NewRequestDraft, PriceBreakdown } from '@/types'

export function Step5Payment({
  draft,
  pricing,
  onBack,
  onSuccess,
}: {
  draft: NewRequestDraft
  pricing: PriceBreakdown
  onBack: () => void
  onSuccess: (requestId: string) => void
}) {
  const { user } = useAuth()
  const [status, setStatus] = useState<'idle' | 'processing' | 'failed'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSuccessPayment() {
    if (!user || !draft.file) return
    setStatus('processing')
    setError(null)
    try {
      const storagePath = await uploadDocument(user.id, draft.file)
      const created = await createPrintRequest({ userId: user.id, storagePath, draft, pricing })
      onSuccess(created.request_id)
    } catch (err) {
      setStatus('failed')
      setError(err instanceof Error ? err.message : 'Something went wrong while saving your request.')
    }
  }

  function handleFailedPayment() {
    setStatus('failed')
    setError(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Payment</h2>
        <p className="text-sm text-slate-400">Prototype simulation — no real payment gateway is used.</p>
      </div>

      <Card className="flex flex-col items-center gap-2 p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <CreditCard className="h-6 w-6" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total amount</p>
        <p className="text-3xl font-bold text-slate-800">{formatCurrency(pricing.totalPrice)}</p>
      </Card>

      {status === 'failed' && (
        <Card className="flex items-start gap-3 border-red-200 bg-red-50/60 p-4">
          <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-600">Payment failed</p>
            <p className="mt-0.5 text-xs text-red-500">
              {error ?? 'Your simulated payment was not successful. The request was not queued.'}
            </p>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          disabled={status === 'processing'}
          onClick={handleSuccessPayment}
          icon={status === 'processing' ? <Spinner className="h-4 w-4 text-white" /> : <CircleCheck className="h-4 w-4" />}
        >
          {status === 'processing' ? 'Processing…' : 'Simulate Successful Payment'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          disabled={status === 'processing'}
          onClick={handleFailedPayment}
          icon={<CircleX className="h-4 w-4" />}
        >
          Simulate Failed Payment
        </Button>
      </div>

      <Button variant="ghost" size="md" onClick={onBack} disabled={status === 'processing'}>
        Back
      </Button>
    </div>
  )
}
