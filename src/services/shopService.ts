import { supabase } from '@/lib/supabase'
import type { PrintShop } from '@/types'

export async function fetchActiveShops(): Promise<PrintShop[]> {
  const { data, error } = await supabase
    .from('print_shops')
    .select('*')
    .eq('active', true)
    .eq('approval_status', 'APPROVED')
    .order('name', { ascending: true })

  if (error) throw error
  return data as PrintShop[]
}

export async function fetchAllShops(): Promise<PrintShop[]> {
  const { data, error } = await supabase
    .from('print_shops')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data as PrintShop[]
}

export async function updateShop(id: string, patch: Partial<PrintShop>): Promise<void> {
  const { error } = await supabase.from('print_shops').update(patch).eq('id', id)
  if (error) throw error
}
