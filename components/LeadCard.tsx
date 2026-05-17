'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Lead } from '@/lib/types'

interface Props {
  lead: Lead
  index: number
  onClick: () => void
}

function getDaysAgo(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

export default function LeadCard({ lead, index, onClick }: Props) {
  const days = getDaysAgo(lead.createdAt)

  const ageLabel = days === 0 ? 'today' : `${days}d`
  const ageClass =
    days > 7
      ? 'text-red-600'
      : days > 3
      ? 'text-amber-600'
      : 'text-slate-400'

  const showDemoDate =
    lead.crmStatus === 'HOME_DEMO_SCHEDULED' || lead.crmStatus === 'HOME_DEMO_COMPLETED'

  const demoTimestamp = lead.confirmedDemoAt ?? lead.demoDate

  return (
    <Draggable draggableId={String(lead.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`group bg-white rounded-lg border border-slate-200/80 px-3 py-2.5 cursor-pointer select-none transition-all duration-150 ${
            snapshot.isDragging
              ? 'shadow-lg border-emerald-300 ring-1 ring-emerald-200/50'
              : 'hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]'
          }`}
        >
          {/* Name */}
          <p className="font-medium text-[13px] text-slate-800 leading-snug truncate">
            {lead.fullName}
          </p>

          {/* Phone + product line */}
          <div className="flex items-center justify-between gap-2 mt-1 text-[11px] text-slate-500">
            <span className="truncate font-mono tabular-nums">{lead.mobileNumber}</span>
            {lead.productName && (
              <span className="truncate text-slate-400 text-right max-w-[55%]">
                {lead.productName}
              </span>
            )}
          </div>

          {/* Footer: age + demo time */}
          {(showDemoDate && demoTimestamp) || days >= 0 ? (
            <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
              <span className={`text-[10px] font-medium ${ageClass}`}>{ageLabel}</span>
              {showDemoDate && demoTimestamp && (
                <span className="text-[10px] font-medium text-purple-600 truncate">
                  {new Date(demoTimestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    ...(lead.confirmedDemoAt
                      ? { hour: 'numeric', minute: '2-digit' }
                      : {}),
                  })}
                  {!lead.confirmedDemoAt && lead.timeSlot && (
                    <span className="text-slate-400">
                      {' · '}
                      {lead.timeSlot[0]}
                      {lead.timeSlot.slice(1).toLowerCase()}
                    </span>
                  )}
                </span>
              )}
            </div>
          ) : null}
        </div>
      )}
    </Draggable>
  )
}
