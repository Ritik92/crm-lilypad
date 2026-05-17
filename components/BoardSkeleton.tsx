import { COLUMN_ORDER, COLUMN_LABELS, LeadStatus } from '@/lib/types'

const COLUMN_ACCENTS: Record<LeadStatus, string> = {
  LEAD: 'col-accent-lead',
  NOT_RESPONDING: 'col-accent-not-resp',
  CALL_BACK: 'col-accent-callback',
  INTERESTED: 'col-accent-interested',
  FIRST_FOLLOW_UP: 'col-accent-first-fu',
  SECOND_FOLLOW_UP: 'col-accent-second-fu',
  NOT_INTERESTED: 'col-accent-not-int',
  HOME_DEMO_SCHEDULED: 'col-accent-demo-sched',
  HOME_DEMO_COMPLETED: 'col-accent-demo-done',
  SALE: 'col-accent-sale',
}

const COLUMN_DOT: Record<LeadStatus, string> = {
  LEAD: 'bg-slate-400',
  NOT_RESPONDING: 'bg-orange-500',
  CALL_BACK: 'bg-yellow-500',
  INTERESTED: 'bg-blue-500',
  FIRST_FOLLOW_UP: 'bg-cyan-500',
  SECOND_FOLLOW_UP: 'bg-teal-500',
  NOT_INTERESTED: 'bg-red-500',
  HOME_DEMO_SCHEDULED: 'bg-purple-500',
  HOME_DEMO_COMPLETED: 'bg-indigo-500',
  SALE: 'bg-emerald-500',
}

const SKELETON_CARD_COUNTS = [3, 2, 2, 3, 2, 1, 2, 2, 2, 1]

export default function BoardSkeleton() {
  return (
    <>
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 crm-pill-rise">
        <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-full pl-2.5 pr-3.5 h-8 shadow-[0_8px_28px_-6px_rgba(15,23,42,0.18)]">
          <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative h-3.5 w-3.5 text-emerald-500"
            >
              <path d="M12 2C8 6 4 9 4 14a8 8 0 0 0 16 0c0-5-4-8-8-12z" />
            </svg>
          </span>
          <span className="text-[12px] font-medium text-slate-600 tracking-tight">
            Loading pipeline
          </span>
        </div>
      </div>

      <div
        className="crm-scroll flex gap-3 px-4 pt-4 pb-3 overflow-x-auto overflow-y-hidden"
        style={{ height: 'calc(100vh - 57px - 44px)' }}
      >
        {COLUMN_ORDER.map((status, colIndex) => (
          <SkeletonColumn
            key={status}
            status={status}
            cardCount={SKELETON_CARD_COUNTS[colIndex]}
            columnIndex={colIndex}
          />
        ))}
      </div>
    </>
  )
}

function SkeletonColumn({
  status,
  cardCount,
  columnIndex,
}: {
  status: LeadStatus
  cardCount: number
  columnIndex: number
}) {
  return (
    <div
      className="flex-shrink-0 w-64 flex flex-col rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] h-full overflow-hidden crm-rise"
      style={{ animationDelay: `${columnIndex * 45}ms` }}
    >
      <div className={`h-[3px] flex-shrink-0 ${COLUMN_ACCENTS[status]}`} />

      <div className="px-3 pt-3 pb-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${COLUMN_DOT[status]} opacity-60`}
          />
          <h2 className="font-semibold text-[11px] text-slate-400 uppercase tracking-[0.06em] leading-tight truncate">
            {COLUMN_LABELS[status]}
          </h2>
        </div>
        <div className="crm-skeleton h-[18px] w-7 rounded-md" />
      </div>

      <div className="flex-1 flex flex-col gap-2 px-2 pt-1 pb-2 min-h-[120px]">
        {Array.from({ length: cardCount }).map((_, i) => (
          <SkeletonCard key={i} variant={i % 3} />
        ))}
      </div>
    </div>
  )
}

function SkeletonCard({ variant }: { variant: number }) {
  const nameWidth = variant === 0 ? 'w-4/5' : variant === 1 ? 'w-3/5' : 'w-2/3'
  const productWidth = variant === 0 ? 'w-14' : variant === 1 ? 'w-10' : 'w-12'

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 px-3 py-2.5">
      <div className={`crm-skeleton h-3 rounded ${nameWidth}`} />
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="crm-skeleton h-2.5 rounded w-20" />
        <div className={`crm-skeleton h-2.5 rounded ${productWidth}`} />
      </div>
      <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100">
        <div className="crm-skeleton h-2 rounded w-6" />
        <div className="crm-skeleton h-2 rounded w-10" />
      </div>
    </div>
  )
}
