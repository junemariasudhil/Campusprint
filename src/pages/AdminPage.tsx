import { useEffect, useState } from 'react'
import { Save, Settings2, Store } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { fetchCurrentRates, updateRates } from '@/services/rateService'
import { fetchAllShops, updateShop } from '@/services/shopService'
import type { ApprovalStatus, PrintRate, PrintShop } from '@/types'

const RATE_FIELDS: { key: keyof PrintRate; label: string; suffix?: string }[] = [
  { key: 'bw_single_page', label: 'B/W single page (₹)' },
  { key: 'bw_double_page', label: 'B/W double page (₹)' },
  { key: 'colour_single_page', label: 'Colour single page (₹)' },
  { key: 'colour_double_page', label: 'Colour double page (₹)' },
  { key: 'staple_fee', label: 'Staple fee (₹)' },
  { key: 'soft_spiral_bind_fee', label: 'Soft spiral binding (₹)' },
  { key: 'hard_spiral_bind_fee', label: 'Hard spiral binding (₹)' },
  { key: 'priority_percentage', label: 'Priority surcharge (0.10 = 10%)' },
]

const APPROVAL_OPTIONS: ApprovalStatus[] = ['APPROVED', 'PENDING', 'SUSPENDED']

export default function AdminPage() {
  const [rates, setRates] = useState<PrintRate | null>(null)
  const [shops, setShops] = useState<PrintShop[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    const [rateData, shopData] = await Promise.all([fetchCurrentRates(), fetchAllShops()])
    setRates(rateData)
    setShops(shopData)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSaveRates() {
    if (!rates) return
    setSaving(true)
    await updateRates(rates.id, rates)
    setSaving(false)
    setSavedAt(Date.now())
  }

  async function handleShopChange(shop: PrintShop, patch: Partial<PrintShop>) {
    setShops((prev) => prev.map((s) => (s.id === shop.id ? { ...s, ...patch } : s)))
    await updateShop(shop.id, patch)
  }

  if (loading || !rates) {
    return (
      <AppShell>
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Admin configuration</h1>
        <p className="text-sm text-slate-400">Manage campus print rates and shop availability.</p>
      </div>

      <Card className="mb-6 p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <Settings2 className="h-4 w-4" />
          </span>
          <h2 className="font-bold text-slate-800">Print rates</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RATE_FIELDS.map((field) => (
            <label key={field.key} className="text-xs font-semibold text-slate-500">
              {field.label}
              <input
                type="number"
                step="0.01"
                value={rates[field.key] as number}
                onChange={(e) => setRates({ ...rates, [field.key]: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-orange-300"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleSaveRates} disabled={saving} icon={<Save className="h-4 w-4" />}>
            {saving ? 'Saving…' : 'Save rates'}
          </Button>
          {savedAt && <span className="text-xs text-green-600">Saved</span>}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Store className="h-4 w-4" />
          </span>
          <h2 className="font-bold text-slate-800">Print shops</h2>
        </div>

        <div className="flex flex-col gap-3">
          {shops.map((shop) => (
            <div key={shop.id} className="rounded-2xl border border-orange-100/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{shop.name}</p>
                  <p className="text-xs text-slate-400">{shop.location}</p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  Active
                  <input
                    type="checkbox"
                    checked={shop.active}
                    onChange={(e) => handleShopChange(shop, { active: e.target.checked })}
                    className="h-4 w-4 accent-orange-500"
                  />
                </label>
              </div>
              <div className="mt-3 flex gap-2">
                {APPROVAL_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleShopChange(shop, { approval_status: status })}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                      shop.approval_status === status
                        ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  )
}
