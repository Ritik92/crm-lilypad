'use client'

import { useState } from 'react'

interface Props {
  onConfirm: (confirmedDemoAt: string) => void
  onCancel: () => void
}

export default function DemoScheduleModal({ onConfirm, onCancel }: Props) {
  const [dateTime, setDateTime] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (!dateTime) {
      setError('Please select a date and time.')
      return
    }
    // datetime-local format: "YYYY-MM-DDTHH:mm" — pass through verbatim as
    // local wall-clock time. Add seconds so backend LocalDateTime parses cleanly.
    const value = dateTime.length === 16 ? `${dateTime}:00` : dateTime
    onConfirm(value)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] px-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">Confirm home demo</h2>
            <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
              Lock in the actual date and time you&apos;ll reach the customer. They&apos;ll be notified of this slot.
            </p>
          </div>
        </div>

        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] mb-1.5">
          Demo date & time
        </label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => {
            setDateTime(e.target.value)
            setError('')
          }}
          className="w-full border border-slate-200 hover:border-slate-300 rounded-lg px-3 h-10 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-colors"
          autoFocus
        />
        {error && <p className="text-red-500 text-[12px] mt-1.5">{error}</p>}

        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg h-9 text-[13px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 text-[13px] font-medium transition-colors shadow-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
