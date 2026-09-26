import { supabase } from '@/lib/supabase'
import type { PrintRequest, RequestStatus } from '@/types'

const QUEUE_STATUSES: RequestStatus[] = [
  'QUEUED',
  'CANCELLATION_PENDING',
  'LOCKED',
  'PRINTING',
  'READY',
]

export async function fetchShopQueue(printShopId: string): Promise<PrintRequest[]> {
  const { data, error } = await supabase
    .from('print_requests')
    .select('*, print_shops(id, name, location), profiles(full_name, email)')
    .eq('print_shop_id', printShopId)
    .in('request_status', QUEUE_STATUSES)
    .order('preferred_pickup_start', { ascending: true })
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as PrintRequest[]
}

export async function fetchShopHistory(printShopId: string): Promise<PrintRequest[]> {
  const { data, error } = await supabase
    .from('print_requests')
    .select('*, print_shops(id, name, location), profiles(full_name, email)')
    .eq('print_shop_id', printShopId)
    .in('request_status', ['COMPLETED', 'CANCELLED', 'REFUNDED'])
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data as PrintRequest[]
}

export async function advanceRequestStatus(id: string, status: RequestStatus): Promise<void> {
  const { error } = await supabase.from('print_requests').update({ request_status: status }).eq('id', id)
  if (error) throw error
}
