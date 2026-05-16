'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
}

const FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'status', label: 'Status' },
  { key: 'product', label: 'Product' },
  { key: 'demoDate', label: 'Demo Date' },
  { key: 'notes', label: 'Notes' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Export CSV</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Date range presets */}
        <p className="text-sm font-medium text-slate-700 mb-2">Date range</p>
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {PRESETS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                mode === key
                  ? 'bg-green-600 text-white border-green-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
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
              <label className="text-xs text-slate-500 mb-1 block">From</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">To</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
          </div>
        )}

        {/* Field selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-2.5">Fields to include</p>
          <div className="grid grid-cols-2 gap-2">
            {FIELDS.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedFields.includes(key)}
                  onChange={() => toggleField(key)}
                  className="accent-green-600 w-4 h-4"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={loading || selectedFields.length === 0}
          className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Exporting…' : 'Download CSV'}
        </button>
      </div>
    </div>
  )
}
