import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, IndianRupee, Package, Plus, TriangleAlert } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { StatCard } from '@/components/StatCard'
import { Pill } from '@/components/ui/Pill'
import { RequestCard } from '@/components/RequestCard'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cancelRequest, fetchMyRequests } from '@/services/requestService'
import { formatCurrency, isCampusEmail } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { PrintRequest } from '@/types'

const FILTERS = ['All', 'Active', 'Ready', 'Completed'] as const
type Filter = (typeof FILTERS)[number]

const ACTIVE_STATUSES = new Set([
  'PAYMENT_PENDING',
  'QUEUED',
  'CANCELLATION_PENDING',
  'LOCKED',
  'PRINTING',
])

export default function DashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<PrintRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('All')

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    const data = await fetchMyRequests(profile.id)
    setRequests(data)
    setLoading(false)
  }, [profile])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!profile) return
    const channel = supabase
      .channel(`dashboard-requests-${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'print_requests', filter: `user_id=eq.${profile.id}` },
        () => load(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile, load])

  async function handleCancel(request: PrintRequest) {
    if (!confirm(`Cancel request ${request.request_id}?`)) return
    await cancelRequest(request.id)
    await load()
  }

  const stats = useMemo(() => {
    const active = requests.filter((r) => ACTIVE_STATUSES.has(r.request_status)).length
    const ready = requests.filter((r) => r.request_status === 'READY').length
    const completed = requests.filter((r) => r.request_status === 'COMPLETED').length
    const totalSpent = requests
      .filter((r) => r.payment_status === 'SUCCESS')
      .reduce((sum, r) => sum + r.total_price, 0)
    return { active, ready, completed, totalSpent }
  }, [requests])

  const filtered = useMemo(() => {
    switch (filter) {
      case 'Active':
        return requests.filter((r) => ACTIVE_STATUSES.has(r.request_status))
      case 'Ready':
        return requests.filter((r) => r.request_status === 'READY')
      case 'Completed':
        return requests.filter((r) => r.request_status === 'COMPLETED')
      default:
        return requests
    }
  }, [requests, filter])

  return (
    <AppShell>
      {profile && !isCampusEmail(profile.email) && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          You're signed in with a non-campus email. Some features may behave differently in production.
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Welcome back,</p>
          <h1 className="text-xl font-bold text-slate-800">{profile?.full_name || profile?.email}</h1>
        </div>
        <Button onClick={() => navigate('/new-request')} icon={<Plus className="h-4 w-4" />}>
          New Print Request
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Package} label="Active Requests" value={stats.active} />
        <StatCard icon={Clock} label="Ready for Pickup" value={stats.ready} />
        <StatCard icon={Package} label="Completed" value={stats.completed} />
        <StatCard icon={IndianRupee} label="Total Spent" value={formatCurrency(stats.totalSpent)} />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
        {FILTERS.map((f) => (
          <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Pill>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-6 w-6" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/30 py-12 text-center text-sm text-slate-400">
          No print requests yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filtered.map((r) => (
            <RequestCard key={r.id} request={r} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
