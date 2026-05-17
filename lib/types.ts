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

export type TimeSlot = 'MORNING' | 'EVENING'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface Lead {
  id: number
  fullName: string
  email: string | null
  mobileNumber: string
  addressLine: string
  pincode: string | null
  productId: string | null
  productName: string | null
  productBrand: string | null
  demoDate: string | null
  timeSlot: TimeSlot | null
  confirmedDemoAt: string | null
  crmStatus: LeadStatus
  crmNotes: string | null
  bookingStatus: BookingStatus
  createdAt: string
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
