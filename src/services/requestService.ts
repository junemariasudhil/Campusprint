import { supabase } from '@/lib/supabase'
import type { NewRequestDraft, PriceBreakdown, PrintRequest } from '@/types'

export interface CreateRequestInput {
  userId: string
  storagePath: string
  draft: NewRequestDraft
  pricing: PriceBreakdown
}

export async function createPrintRequest(input: CreateRequestInput): Promise<PrintRequest> {
  const { userId, storagePath, draft, pricing } = input

  const { data, error } = await supabase
    .from('print_requests')
    .insert({
      user_id: userId,
      print_shop_id: draft.printShopId,
      document_name: draft.documentName,
      storage_path: storagePath,
      page_count: draft.pageCount,
      copies: draft.copies,
      colour_mode: draft.colourMode,
      sides: draft.sides,
      stapling: draft.stapling,
      binding: draft.binding,
      comments: draft.comments || null,
      preferred_pickup_start: draft.preferredPickupStart,
      preferred_pickup_end: draft.preferredPickupEnd,
      priority: draft.priority,
      base_price: pricing.basePrice,
      finishing_price: pricing.finishingPrice,
      priority_fee: pricing.priorityFee,
      total_price: pricing.totalPrice,
      payment_status: 'SUCCESS',
      request_status: 'QUEUED',
    })
    .select('*, print_shops(id, name, location)')
    .single()

  if (error) throw error
  return data as PrintRequest
}

export async function fetchMyRequests(userId: string): Promise<PrintRequest[]> {
  const { data, error } = await supabase
    .from('print_requests')
    .select('*, print_shops(id, name, location)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as PrintRequest[]
}

const CANCELLABLE_STATUSES = new Set(['PAYMENT_PENDING', 'QUEUED', 'CANCELLATION_PENDING'])

export function canCancelRequest(status: PrintRequest['request_status']): boolean {
  return CANCELLABLE_STATUSES.has(status)
}

export async function cancelRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from('print_requests')
    .update({ request_status: 'CANCELLED' })
    .eq('id', id)

  if (error) throw error
}

export async function estimateQueuePosition(
  printShopId: string,
  preferredPickupStart: string,
  priority: boolean,
): Promise<number> {
  const { data, error } = await supabase
    .from('print_requests')
    .select('preferred_pickup_start, priority, created_at')
    .eq('print_shop_id', printShopId)
    .eq('request_status', 'QUEUED')

  if (error) throw error

  const existing = data as { preferred_pickup_start: string; priority: boolean; created_at: string }[]
  const candidate = { preferred_pickup_start: preferredPickupStart, priority, created_at: new Date().toISOString() }
  const all = [...existing, candidate]

  all.sort((a, b) => {
    if (a.preferred_pickup_start !== b.preferred_pickup_start) {
      return a.preferred_pickup_start.localeCompare(b.preferred_pickup_start)
    }
    if (a.priority !== b.priority) {
      return a.priority ? -1 : 1
    }
    return a.created_at.localeCompare(b.created_at)
  })

  return all.indexOf(candidate) + 1
}
