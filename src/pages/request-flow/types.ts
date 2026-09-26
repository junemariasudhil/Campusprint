import type { NewRequestDraft } from '@/types'

export interface StepProps {
  draft: NewRequestDraft
  updateDraft: (patch: Partial<NewRequestDraft>) => void
}
