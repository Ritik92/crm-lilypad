'use client'

import { Draggable } from '@hello-pangea/dnd'
import { NotifyMeRequest } from '@/lib/types'

interface Props {
  request: NotifyMeRequest
  index: number
  onClick: () => void
}

function getDaysAgo(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
}

export default function NotifyMeCard({ request, index, onClick }: Props) {
  const days = getDaysAgo(request.createdAt)

  const ageLabel = days === 0 ? 'today' : `${days}d`
  const ageClass =
    days > 7
      ? 'text-red-600'
      : days > 3
      ? 'text-amber-600'
      : 'text-slate-400'

  const showDemoDate =
    request.crmStatus === 'HOME_DEMO_SCHEDULED' || request.crmStatus === 'HOME_DEMO_COMPLETED'

  const variantColor = [request.variantName, request.colorName].filter(Boolean).join(' · ')

  return (
    <Draggable draggableId={String(request.id)} index={index}>
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
            {request.fullName}
          </p>

          {/* Phone + pincode */}
          <div className="flex items-center justify-between gap-2 mt-1 text-[11px] text-slate-500">
            <span className="truncate font-mono tabular-nums">{request.phoneNumber}</span>
            <span className="truncate text-slate-400 font-mono tabular-nums">{request.pincode}</span>
          </div>

          {/* Product */}
          {request.productName && (
            <p className="text-[11px] text-slate-500 mt-1 truncate">{request.productName}</p>
          )}

          {/* Variant + color */}
          {variantColor && (
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{variantColor}</p>
          )}

          {/* Footer: age + demo time */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
            <span className={`text-[10px] font-medium ${ageClass}`}>{ageLabel}</span>
            {showDemoDate && request.confirmedDemoAt && (
              <span className="text-[10px] font-medium text-purple-600 truncate">
                {new Date(request.confirmedDemoAt).toLocaleDateString('en-US', {
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
