import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string | number
}) {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-xl font-bold text-slate-800">{value}</span>
      <span className="text-xs font-medium text-slate-400">{label}</span>
    </Card>
  )
}
