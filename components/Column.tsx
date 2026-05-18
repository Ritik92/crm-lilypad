'use client'

import { Droppable } from '@hello-pangea/dnd'
import { Lead, LeadStatus, COLUMN_LABELS } from '@/lib/types'
import LeadCard from '@/components/LeadCard'

interface Props {
  status: LeadStatus
  leads: Lead[]
  onCardClick: (lead: Lead) => void
}

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

export default function Column({ status, leads, onCardClick }: Props) {
  return (
    <div className="flex-shrink-0 w-64 flex flex-col rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] min-h-full">
      {/* Accent bar */}
      <div className={`h-[3px] flex-shrink-0 ${COLUMN_ACCENTS[status]}`} />

      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${COLUMN_DOT[status]}`} />
          <h2 className="font-semibold text-[11px] text-slate-500 uppercase tracking-[0.06em] leading-tight truncate">
            {COLUMN_LABELS[status]}
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-1.5 py-0.5 min-w-[22px] text-center tabular-nums">
          {leads.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2 px-2 pt-1 pb-2 min-h-[120px] transition-colors duration-150 ${
              snapshot.isDraggingOver ? 'bg-emerald-50/60' : ''
            }`}
          >
            {leads.map((lead, index) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={index}
                onClick={() => onCardClick(lead)}
              />
            ))}
            {provided.placeholder}
            {leads.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center text-[11px] text-slate-300 py-6 select-none">
                No leads
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
