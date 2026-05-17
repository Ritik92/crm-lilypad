'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
}

const FIELDS = [
  { key: 'fullName', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobileNumber', label: 'Phone' },
  { key: 'addressLine', label: 'Address' },
  { key: 'pincode', label: 'Pincode' },
  { key: 'productName', label: 'Product' },
  { key: 'productBrand', label: 'Brand' },
  { key: 'crmStatus', label: 'CRM Status' },
  { key: 'bookingStatus', label: 'Booking Status' },
  { key: 'demoDate', label: 'Requested Demo Date' },
  { key: 'timeSlot', label: 'Requested Slot' },
  { key: 'confirmedDemoAt', label: 'Confirmed Demo At' },
  { key: 'crmNotes', label: 'Notes' },
  { key: 'createdAt', label: 'Created At' },
] as const

type Mode = 'all' | 'last1m' | 'prevMonth' | 'last3m' | 'last6m' | 'last12m' | 'custom'

const PRESETS: { key: Mode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'last1m', label: '1M' },
  { key: 'prevMonth', label: 'Prev Month' },
  { key: 'last3m', label: '3M' },
  { key: 'last6m', label: '6M' },
  { key: 'last12m', label: '12M' },
  { key: 'custom', label: 'Custom' },
]

function getPresetDates(mode: Mode): { from: string; to: string } | null {
  if (mode === 'all' || mode === 'custom') return null

  const now = new Date()
  const toStr = now.toISOString().split('T')[0]

  if (mode === 'prevMonth') {
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastOfPrevMonth = new Date(firstOfThisMonth.getTime() - 1)
    const firstOfPrevMonth = new Date(lastOfPrevMonth.getFullYear(), lastOfPrevMonth.getMonth(), 1)
    return {
      from: firstOfPrevMonth.toISOString().split('T')[0],
      to: lastOfPrevMonth.toISOString().split('T')[0],
    }
  }

  const daysBack = { last1m: 30, last3m: 90, last6m: 180, last12m: 365 }[mode]
  const from = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
  return { from: from.toISOString().split('T')[0], to: toStr }
}

export default function ExportModal({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [selectedFields, setSelectedFields] = useState<string[]>(
    FIELDS.map((f) => f.key)
  )
  const [loading, setLoading] = useState(false)

  const toggleField = (key: string) =>
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    )

  const handleExport = async () => {
    if (selectedFields.length === 0) return
    setLoading(true)

    const params = new URLSearchParams()
    const preset = getPresetDates(mode)

    if (preset) {
      params.set('from', preset.from)
      params.set('to', preset.to)
    } else if (mode === 'custom') {
      if (customFrom) params.set('from', customFrom)
      if (customTo) params.set('to', customTo)
    }

    params.set('fields', selectedFields.join(','))

    try {
      const res = await fetch(`/api/leads/export?${params}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lilypad-leads-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-md max-h-[90vh] overflow-y-auto crm-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-6">
          <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-[15px] font-semibold text-slate-900">Export leads</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Download a CSV of your pipeline.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md w-7 h-7 flex items-center justify-center text-xl leading-none transition-colors -mr-1 -mt-1"
          >
            ×
          </button>
        </div>

        {/* Date range presets */}
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] mb-2">Date range</p>
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {PRESETS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`h-8 rounded-md text-[12px] font-medium border transition-colors ${
                mode === key
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom date pickers */}
        {mode === 'custom' && (
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <label className="text-[11px] text-slate-500 mb-1 block">From</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 h-9 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-slate-500 mb-1 block">To</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 h-9 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
              />
            </div>
          </div>
        )}

        {/* Field selection */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] mb-2.5">Fields to include</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {FIELDS.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 text-[13px] text-slate-700 cursor-pointer select-none hover:text-slate-900"
              >
                <input
                  type="checkbox"
                  checked={selectedFields.includes(key)}
                  onChange={() => toggleField(key)}
                  className="accent-emerald-600 w-3.5 h-3.5"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={loading || selectedFields.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-10 text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? 'Exporting…' : `Download CSV`}
        </button>
      </div>
    </div>
  )
}
