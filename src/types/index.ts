export const ROLES = ['student', 'teacher', 'print_shop', 'admin'] as const
export type Role = (typeof ROLES)[number]

export const APPROVAL_STATUSES = ['APPROVED', 'PENDING', 'SUSPENDED'] as const
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number]

export const COLOUR_MODES = ['BW', 'COLOUR'] as const
export type ColourMode = (typeof COLOUR_MODES)[number]

export const SIDES_OPTIONS = ['SINGLE', 'DOUBLE'] as const
export type Sides = (typeof SIDES_OPTIONS)[number]

export const STAPLING_OPTIONS = ['NONE', 'STAPLE'] as const
export type Stapling = (typeof STAPLING_OPTIONS)[number]

export const BINDING_OPTIONS = ['NONE', 'SOFT_SPIRAL', 'HARD_SPIRAL'] as const
export type Binding = (typeof BINDING_OPTIONS)[number]

export const PAYMENT_STATUSES = ['PENDING', 'SUCCESS', 'FAILED'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const REQUEST_STATUSES = [
  'PAYMENT_PENDING',
  'QUEUED',
  'CANCELLATION_PENDING',
  'LOCKED',
  'PRINTING',
  'READY',
  'COMPLETED',
  'CANCELLED',
  'REFUND_PENDING',
  'REFUNDED',
] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: Role
  created_at: string
}

export interface PrintShop {
  id: string
  name: string
  location: string
  active: boolean
  approval_status: ApprovalStatus
  created_at: string
}

export interface PrintRate {
  id: string
  bw_single_page: number
  bw_double_page: number
  colour_single_page: number
  colour_double_page: number
  staple_fee: number
  soft_spiral_bind_fee: number
  hard_spiral_bind_fee: number
  priority_percentage: number
  updated_at: string
}

export interface PrintRequest {
  id: string
  request_id: string
  user_id: string
  print_shop_id: string
  document_name: string
  storage_path: string
  page_count: number
  copies: number
  colour_mode: ColourMode
  sides: Sides
  stapling: Stapling
  binding: Binding
  comments: string | null
  preferred_pickup_start: string
  preferred_pickup_end: string
  priority: boolean
  base_price: number
  finishing_price: number
  priority_fee: number
  total_price: number
  payment_status: PaymentStatus
  request_status: RequestStatus
  created_at: string
  updated_at: string
  print_shops?: Pick<PrintShop, 'id' | 'name' | 'location'>
}

export interface PriceBreakdown {
  basePrice: number
  finishingPrice: number
  priorityFee: number
  totalPrice: number
}

export interface NewRequestDraft {
  file: File | null
  documentName: string
  pageCount: number
  copies: number
  colourMode: ColourMode
  sides: Sides
  stapling: Stapling
  binding: Binding
  comments: string
  printShopId: string
  preferredPickupStart: string
  preferredPickupEnd: string
  priority: boolean
}

export const PICKUP_SLOTS: { start: string; end: string; label: string }[] = [
  { start: '10:00', end: '10:30', label: '10:00 – 10:30' },
  { start: '10:30', end: '11:00', label: '10:30 – 11:00' },
  { start: '11:00', end: '11:30', label: '11:00 – 11:30' },
  { start: '11:30', end: '12:00', label: '11:30 – 12:00' },
  { start: '12:00', end: '12:30', label: '12:00 – 12:30' },
  { start: '14:00', end: '14:30', label: '2:00 – 2:30 PM' },
]

export const CAMPUS_EMAIL_DOMAIN = '@rajagiri.edu.in'
