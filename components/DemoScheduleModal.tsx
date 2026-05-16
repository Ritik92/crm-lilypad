'use client'

import { useState } from 'react'

interface Props {
  onConfirm: (demoDate: string) => void
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
    onConfirm(new Date(dateTime).toISOString())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Schedule Home Demo</h2>
        <p className="text-sm text-slate-500 mb-6">
          Select a date and time before moving this lead to Home Demo Scheduled.
        </p>

        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Demo Date & Time
        </label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => {
            setDateTime(e.target.value)
            setError('')
          }}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
          autoFocus
        />
        {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-300 text-slate-600 rounded-lg py-2 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
