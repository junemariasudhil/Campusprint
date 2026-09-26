import { supabase } from '@/lib/supabase'
import type { PrintRate } from '@/types'

export async function fetchCurrentRates(): Promise<PrintRate> {
  const { data, error } = await supabase
    .from('print_rates')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error
  return data as PrintRate
}

export async function updateRates(id: string, patch: Partial<PrintRate>): Promise<void> {
  const { error } = await supabase.from('print_rates').update(patch).eq('id', id)
  if (error) throw error
}
