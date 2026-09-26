import { CheckCircle2, MapPin, Store } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { PrintShop } from '@/types'
import type { StepProps } from './types'

export function Step3Shop({
  draft,
  updateDraft,
  shops,
  onNext,
  onBack,
}: StepProps & { shops: PrintShop[]; onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Choose a print shop</h2>
        <p className="text-sm text-slate-400">Only active, approved campus print centers are shown.</p>
      </div>

      <div className="flex flex-col gap-3">
        {shops.map((shop) => {
          const selected = draft.printShopId === shop.id
          return (
            <Card
              key={shop.id}
              onClick={() => updateDraft({ printShopId: shop.id })}
              className={`flex cursor-pointer items-center gap-3 p-4 transition-colors ${
                selected ? 'border-orange-400 ring-2 ring-orange-200' : ''
              }`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Store className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{shop.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-blue-600">
                  <MapPin className="h-3 w-3" />
                  {shop.location}
                </p>
                <span className="mt-1 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  Active
                </span>
              </div>
              {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />}
            </Card>
          )
        })}

        {shops.length === 0 && (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/30 py-10 text-center text-sm text-slate-400">
            No print shops are currently active.
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-3">
        <Button variant="secondary" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" fullWidth disabled={!draft.printShopId} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}
