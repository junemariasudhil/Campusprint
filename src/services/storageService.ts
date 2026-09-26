import { PRINT_DOCUMENTS_BUCKET, supabase } from '@/lib/supabase'

export async function uploadDocument(userId: string, file: File): Promise<string> {
  const path = `${userId}/${Date.now()}-${file.name}`

  const { error } = await supabase.storage.from(PRINT_DOCUMENTS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error
  return path
}

export async function getDocumentUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(PRINT_DOCUMENTS_BUCKET)
    .createSignedUrl(path, 60 * 5)

  if (error) throw error
  return data.signedUrl
}
