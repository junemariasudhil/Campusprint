import clsx, { type ClassValue } from 'clsx'
import { CAMPUS_EMAIL_DOMAIN } from '@/types'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isCampusEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase().endsWith(CAMPUS_EMAIL_DOMAIN)
}
