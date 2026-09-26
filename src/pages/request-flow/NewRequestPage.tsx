import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Spinner } from '@/components/ui/Spinner'
import { fetchActiveShops } from '@/services/shopService'
import { fetchCurrentRates } from '@/services/rateService'
import { calculatePrice } from '@/services/pricingService'
import type { NewRequestDraft, PrintRate, PrintShop } from '@/types'
import { StepIndicator } from './StepIndicator'
import { Step1Upload } from './Step1Upload'
import { Step2Config } from './Step2Config'
import { Step3Shop } from './Step3Shop'
import { Step4Price } from './Step4Price'
import { Step5Payment } from './Step5Payment'

const INITIAL_DRAFT: NewRequestDraft = {
  file: null,
  documentName: '',
  pageCount: 0,
  copies: 1,
  colourMode: 'BW',
  sides: 'SINGLE',
  stapling: 'NONE',
  binding: 'NONE',
  comments: '',
  printShopId: '',
  preferredPickupStart: '',
  preferredPickupEnd: '',
  priority: false,
}

export default function NewRequestPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<NewRequestDraft>(INITIAL_DRAFT)
  const [shops, setShops] = useState<PrintShop[]>([])
  const [rates, setRates] = useState<PrintRate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchActiveShops(), fetchCurrentRates()]).then(([shopList, rateData]) => {
      setShops(shopList)
      setRates(rateData)
      setLoading(false)
    })
  }, [])

  function updateDraft(patch: Partial<NewRequestDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  const pricing = useMemo(() => {
    if (!rates) return null
    return calculatePrice(rates, {
      pageCount: draft.pageCount,
      copies: draft.copies,
      colourMode: draft.colourMode,
      sides: draft.sides,
      stapling: draft.stapling,
      binding: draft.binding,
      priority: draft.priority,
    })
  }, [rates, draft.pageCount, draft.copies, draft.colourMode, draft.sides, draft.stapling, draft.binding, draft.priority])

  function goBack() {
    if (step === 1) {
      navigate('/dashboard')
    } else {
      setStep((s) => s - 1)
    }
  }

  function handleSuccess() {
    navigate('/dashboard')
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
      <button
        onClick={goBack}
        className="mb-4 flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <StepIndicator step={step} />

      {loading || !rates ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <>
          {step === 1 && <Step1Upload draft={draft} updateDraft={updateDraft} onNext={() => setStep(2)} />}
          {step === 2 && (
            <Step2Config draft={draft} updateDraft={updateDraft} onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <Step3Shop
              draft={draft}
              updateDraft={updateDraft}
              shops={shops}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && pricing && (
            <Step4Price draft={draft} updateDraft={updateDraft} pricing={pricing} onNext={() => setStep(5)} onBack={() => setStep(3)} />
          )}
          {step === 5 && pricing && (
            <Step5Payment draft={draft} pricing={pricing} onBack={() => setStep(4)} onSuccess={handleSuccess} />
          )}
        </>
      )}
      </div>
    </AppShell>
  )
}
