import { useCallback, useEffect, useMemo, useState } from 'react'
import { Clock, ListOrdered, Printer, TriangleAlert } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { StatCard } from '@/components/StatCard'
import { Pill } from '@/components/ui/Pill'
import { ShopRequestCard } from '@/components/ShopRequestCard'
import { Spinner } from '@/components/ui/Spinner'
import { supabase } from '@/lib/supabase'
import { advanceRequestStatus, fetchShopHistory, fetchShopQueue } from '@/services/printShopService'
import type { PrintRequest, RequestStatus } from '@/types'

type Tab = 'Live Queue' | 'History'

export default function PrintShopPage() {
  const { profile } = useAuth()
  const [queue, setQueue] = useState<PrintRequest[]>([])
  const [history, setHistory] = useState<PrintRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('Live Queue')

  const shopId = profile?.print_shop_id ?? null

  const load = useCallback(async () => {
    if (!shopId) return
    setLoading(true)
    setLoadError(null)
    // Same fix as DashboardPage: an unhandled rejection here used to leave the
    // queue stuck on the spinner forever with no error shown.
    try {
      const [queueData, historyData] = await Promise.all([fetchShopQueue(shopId), fetchShopHistory(shopId)])
      setQueue(queueData)
      setHistory(historyData)
    } catch (err) {
      console.error('Failed to load print shop queue:', err)
      setLoadError(err instanceof Error ? err.message : 'Failed to load the queue.')
    } finally {
      setLoading(false)
    }
  }, [shopId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!shopId) return
    const channel = supabase
      .channel(`print-shop-queue-${shopId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'print_requests', filter: `print_shop_id=eq.${shopId}` },
        () => load(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [shopId, load])

  const stats = useMemo(() => {
    const queued = queue.filter((r) => r.request_status === 'QUEUED').length
    const printing = queue.filter((r) => r.request_status === 'PRINTING').length
    const ready = queue.filter((r) => r.request_status === 'READY').length
    return { queued, printing, ready }
  }, [queue])

  async function handleAdvance(id: string, next: RequestStatus) {
    await advanceRequestStatus(id, next)
    await load()
  }

  if (!shopId) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-orange-200 bg-orange-50/30 py-16 text-center">
          <TriangleAlert className="h-6 w-6 text-amber-500" />
          <p className="max-w-md text-sm font-medium text-slate-500">
            This account has the <span className="font-bold">print_shop</span> role but isn't linked to a print
            shop yet. Ask an admin to set <code className="rounded bg-white px-1">profiles.print_shop_id</code> for
            this account.
          </p>
        </div>
      </AppShell>
    )
  }

  const list = tab === 'Live Queue' ? queue : history

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-500/20">
          <Printer className="h-4 w-4" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Print shop queue</h1>
          <p className="text-sm text-slate-400">Live incoming requests update automatically — no refresh needed.</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 2xl:gap-6">
        <StatCard icon={ListOrdered} label="Queued" value={stats.queued} />
        <StatCard icon={Printer} label="Printing" value={stats.printing} />
        <StatCard icon={Clock} label="Ready for pickup" value={stats.ready} />
      </div>

      <div className="mb-4 flex gap-2">
        {(['Live Queue', 'History'] as Tab[]).map((t) => (
          <Pill key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Pill>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-6 w-6" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-red-200 bg-red-50/40 py-12 text-center text-sm text-red-600">
          <p>{loadError}</p>
          <button
            onClick={load}
            className="rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/30 py-12 text-center text-sm text-slate-400">
          {tab === 'Live Queue' ? 'No active requests right now.' : 'No completed requests yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {list.map((r) => (
            <ShopRequestCard key={r.id} request={r} onAdvance={handleAdvance} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
