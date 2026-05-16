export type LeadStatus =
  | 'LEAD'
  | 'NOT_RESPONDING'
  | 'CALL_BACK'
  | 'INTERESTED'
  | 'FIRST_FOLLOW_UP'
  | 'SECOND_FOLLOW_UP'
  | 'NOT_INTERESTED'
  | 'HOME_DEMO_SCHEDULED'
  | 'HOME_DEMO_COMPLETED'
  | 'SALE'

export const PRODUCTS = [
  'Ather Rizta',
  'Oben Rorr Ez Sigma',
  'Bajaj Chetak',
  'TVS iQube',
] as const

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: LeadStatus
  product: string | null
  notes: string | null
  demoDate: string | null
  createdAt: string
  updatedAt: string
}

export const COLUMN_ORDER: LeadStatus[] = [
  'LEAD',
  'NOT_RESPONDING',
  'CALL_BACK',
  'INTERESTED',
  'FIRST_FOLLOW_UP',
  'SECOND_FOLLOW_UP',
  'NOT_INTERESTED',
  'HOME_DEMO_SCHEDULED',
  'HOME_DEMO_COMPLETED',
  'SALE',
]

export const COLUMN_LABELS: Record<LeadStatus, string> = {
  LEAD: 'Lead',
  NOT_RESPONDING: 'Not Responding',
  CALL_BACK: 'Call Back',
  INTERESTED: 'Interested',
  FIRST_FOLLOW_UP: 'First Follow Up',
  SECOND_FOLLOW_UP: 'Second Follow Up',
  NOT_INTERESTED: 'Not Interested',
  HOME_DEMO_SCHEDULED: 'Home Demo Scheduled',
  HOME_DEMO_COMPLETED: 'Home Demo Completed',
  SALE: 'Sale',
}
