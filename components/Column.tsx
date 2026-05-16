'use client'

import { Droppable } from '@hello-pangea/dnd'
import { Lead, LeadStatus, COLUMN_LABELS } from '@/lib/types'
import LeadCard from '@/components/LeadCard'

interface Props {
  status: LeadStatus
  leads: Lead[]
  onCardClick: (lead: Lead) => void
}

const COLUMN_COLORS: Record<LeadStatus, string> = {
  LEAD: 'bg-slate-200 text-slate-700',
  NOT_RESPONDING: 'bg-orange-100 text-orange-700',
  CALL_BACK: 'bg-yellow-100 text-yellow-700',
  INTERESTED: 'bg-blue-100 text-blue-700',
  FIRST_FOLLOW_UP: 'bg-cyan-100 text-cyan-700',
  SECOND_FOLLOW_UP: 'bg-teal-100 text-teal-700',
  NOT_INTERESTED: 'bg-red-100 text-red-700',
  HOME_DEMO_SCHEDULED: 'bg-purple-100 text-purple-700',
  HOME_DEMO_COMPLETED: 'bg-indigo-100 text-indigo-700',
  SALE: 'bg-green-100 text-green-700',
}

export default function Column({ status, leads, onCardClick }: Props) {
  return (
    <div className="flex-shrink-0 w-60 flex flex-col rounded-xl bg-white shadow-sm border border-slate-200">
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-slate-100">
        <h2 className="font-semibold text-xs text-slate-600 uppercase tracking-wide leading-tight">
          {COLUMN_LABELS[status]}
        </h2>
        <span className={`text-xs font-bold rounded-full px-2 py-0.5 min-w-[22px] text-center ${COLUMN_COLORS[status]}`}>
          {leads.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2 p-2 rounded-b-xl min-h-[120px] transition-colors duration-150 ${
              snapshot.isDraggingOver ? 'bg-green-50' : ''
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
          </div>
        )}
      </Droppable>
    </div>
  )
}
