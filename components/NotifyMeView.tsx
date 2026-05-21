'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import NotifyMeBoard from '@/components/NotifyMeBoard'
import {
  DEFAULT_RANGE,
  RANGE_OPTIONS,
  RangeFilter,
  rangeToFromDate,
} from '@/lib/filters'
import type { NotifyMeRequest } from '@/lib/types'

interface Props {
  searchQuery: string
  range: RangeFilter
  onRangeChange: (range: RangeFilter) => void
}

export default function NotifyMeView({ searchQuery, range, onRangeChange }: Props) {
  const [allRequests, setAllRequests] = useState<NotifyMeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchSeq = useRef(0)

  useEffect(() => {
    const seq = ++fetchSeq.current
    const isInitial = allRequests.length === 0 && loading
    if (!isInitial) setRefreshing(true)

    const from = rangeToFromDate(range)
    const qs = from ? `?from=${from}` : ''

    fetch(`/api/notify-me${qs}`)
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = '/login'
          return null
        }
        if (!r.ok) {
          const text = await r.text().catch(() => '')
          throw new Error(`${r.status}: ${text || r.statusText}`)
        }
        return r.json()
      })
      .then((data) => {
        if (seq !== fetchSeq.current) return
        if (data) setAllRequests(data)
        setLoading(false)
        setRefreshing(false)
      })
      .catch((e) => {
        if (seq !== fetchSeq.current) return
        setError(e instanceof Error ? e.message : String(e))
        setLoading(false)
        setRefreshing(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  const handleUpdate = (updated: NotifyMeRequest) => {
    setAllRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }

  const handleDelete = (requestId: number) => {
    setAllRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return allRequests
    return allRequests.filter((r) => {
      const hay = (
        (r.fullName ?? '') + ' ' +
        (r.email ?? '') + ' ' +
        (r.phoneNumber ?? '') + ' ' +
        (r.pincode ?? '') + ' ' +
        (r.productName ?? '') + ' ' +
        (r.variantName ?? '') + ' ' +
        (r.colorName ?? '')
      ).toLowerCase()
      return hay.includes(q)
    })
  }, [allRequests, searchQuery])

  const isFiltered = filteredRequests.length !== allRequests.length

  return (
    <>
      <div className="bg-white border-b border-slate-200/80 px-5 h-[44px] flex items-center gap-2 sticky top-[57px] z-10">
        <RangePill range={range} onChange={onRangeChange} />
        <div className="ml-auto flex items-center gap-3 text-[12px]">
          {refreshing && (
            <span className="flex items-center gap-1.5 text-slate-500">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Refreshing…
            </span>
          )}
          <span className="text-slate-500 tabular-nums">
            {isFiltered ? (
              <>
                <span className="text-slate-900 font-medium">{filteredRequests.length}</span>
                <span className="text-slate-400"> of {allRequests.length}</span>
              </>
            ) : (
              <>
                <span className="text-slate-900 font-medium">{allRequests.length}</span>
                <span className="text-slate-400"> requests</span>
              </>
            )}
          </span>
        </div>
      </div>

      <NotifyMeBoard
        requests={filteredRequests}
        loading={loading}
        error={error}
        onRequestUpdate={handleUpdate}
        onRequestDelete={handleDelete}
      />
    </>
  )
}

function RangePill({
  range,
  onChange,
}: {
  range: RangeFilter
  onChange: (r: RangeFilter) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const current = RANGE_OPTIONS.find((o) => o.value === range)
  const isActive = range !== DEFAULT_RANGE

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors border ${
          isActive
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <span className="text-slate-400 mr-1">Range:</span>
        <span>{current?.label ?? 'Last month'}</span>
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3 ml-1 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[150px] z-30">
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-slate-50 ${
                range === o.value ? 'text-slate-900 font-medium' : 'text-slate-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
