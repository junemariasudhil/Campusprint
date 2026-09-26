import type { Role } from '@/types'

export function roleHomePath(role: Role | undefined | null): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'print_shop':
      return '/print-shop'
    default:
      return '/dashboard'
  }
}
