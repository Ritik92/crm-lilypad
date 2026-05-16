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

const PRODUCT_COLORS: Record<string, string> = {
  'Ather Rizta': 'bg-sky-100 text-sky-700',
  'Oben Rorr Ez Sigma': 'bg-orange-100 text-orange-700',
  'Bajaj Chetak': 'bg-emerald-100 text-emerald-700',
  'TVS iQube': 'bg-violet-100 text-violet-700',
}

function getProductColor(product: string) {
  return PRODUCT_COLORS[product] ?? 'bg-slate-100 text-slate-600'
}

export default function LeadCard({ lead, index, onClick }: Props) {
  const days = getDaysAgo(lead.createdAt)
  const ageBadgeClass =
    days > 7
      ? 'bg-red-100 text-red-700'
      : days > 3
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-slate-100 text-slate-500'

  const showDate =
    lead.demoDate &&
    (lead.status === 'HOME_DEMO_SCHEDULED' || lead.status === 'HOME_DEMO_COMPLETED')

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-lg border p-3 cursor-pointer select-none transition-all ${
            snapshot.isDragging
              ? 'shadow-xl border-green-300 rotate-1'
              : 'border-slate-200 hover:border-green-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-800 truncate">{lead.name}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{lead.phone}</p>
            </div>
            {lead.product && (
              <span className={`text-xs rounded-full px-2 py-0.5 font-medium whitespace-nowrap flex-shrink-0 mt-0.5 ${getProductColor(lead.product)}`}>
                {lead.product}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {days >= 0 && (
              <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${ageBadgeClass}`}>
                {days === 0 ? 'Today' : `${days}d`}
              </span>
            )}
            {showDate && (
              <span className="text-xs bg-purple-50 text-purple-600 rounded-full px-2 py-0.5 font-medium">
                {new Date(lead.demoDate!).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
