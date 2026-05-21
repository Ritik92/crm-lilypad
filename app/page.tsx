'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Board from '@/components/Board'
import SearchBar from '@/components/SearchBar'
import ExportModal from '@/components/ExportModal'
import FilterBar from '@/components/FilterBar'
import CreateLeadModal from '@/components/CreateLeadModal'
import NotifyMeView from '@/components/NotifyMeView'
import {
  DEFAULT_RANGE,
  EMPTY_FILTERS,
  Filters,
  RangeFilter,
  filtersFromSearchParams,
  filtersToSearchParams,
  matchesFilters,
  rangeFromSearchParams,
  rangeToFromDate,
} from '@/lib/filters'
import type { Lead } from '@/lib/types'

type View = 'leads' | 'notify-me'

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      }
    >
      <HomePageInner />
    </Suspense>
  )
}

function HomePageInner() {
  const [view, setView] = useState<View>('leads')
  const [searchQuery, setSearchQuery] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [range, setRange] = useState<RangeFilter>(DEFAULT_RANGE)
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const params = useSearchParams()
  const initialized = useRef(false)
  const fetchSeq = useRef(0)

  // Read filters + range + view from URL on first mount
  useEffect(() => {
    const sp = new URLSearchParams(params.toString())
    setFilters(filtersFromSearchParams(sp))
    setRange(rangeFromSearchParams(sp))
    const v = sp.get('view')
    if (v === 'notify-me') setView('notify-me')
    initialized.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch leads — only when leads view is active
  useEffect(() => {
    if (!initialized.current) return
    if (view !== 'leads') return
    const seq = ++fetchSeq.current
    const isInitial = allLeads.length === 0 && loading
    if (!isInitial) setRefreshing(true)

    const from = rangeToFromDate(range)
    const qs = from ? `?from=${from}` : ''

    fetch(`/api/leads${qs}`)
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
        if (data) setAllLeads(data)
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
  }, [range, view, initialized.current])

  const updateFilters = (next: Filters) => {
    setFilters(next)
    syncUrl(next, range, view)
  }

  const updateRange = (next: RangeFilter) => {
    setRange(next)
    syncUrl(filters, next, view)
  }

  const updateView = (next: View) => {
    setView(next)
    syncUrl(filters, range, next)
  }

  const syncUrl = (f: Filters, r: RangeFilter, v: View) => {
    const sp = filtersToSearchParams(f, r)
    if (v !== 'leads') sp.set('view', v)
    const qs = sp.toString()
    router.replace(qs ? `/?${qs}` : '/', { scroll: false })
  }

  const handleLeadUpdate = (updated: Lead) => {
    setAllLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
  }

  const handleLeadDelete = (leadId: number) => {
    setAllLeads((prev) => prev.filter((l) => l.id !== leadId))
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const availableBrands = useMemo(() => {
    const set = new Set<string>()
    let hasUnknown = false
    for (const l of allLeads) {
      if (l.productBrand) set.add(l.productBrand)
      else hasUnknown = true
    }
    const list = Array.from(set).sort()
    if (hasUnknown) list.push('__unknown__')
    return list
  }, [allLeads])

  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return allLeads.filter((l) => {
      if (!matchesFilters(l, filters)) return false
      if (q) {
        const hay =
          (l.fullName ?? '').toLowerCase() +
          ' ' +
          (l.email ?? '').toLowerCase() +
          ' ' +
          (l.mobileNumber ?? '').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [allLeads, filters, searchQuery])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-5 h-[57px] flex items-center gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 2C8 6 4 9 4 14a8 8 0 0 0 16 0c0-5-4-8-8-12z" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-slate-800 text-[15px] tracking-tight">Lilypad</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-[0.12em] mt-0.5">CRM</span>
          </div>
        </div>

        <Tabs view={view} onChange={updateView} />

        <div className="ml-auto flex items-center gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          {view === 'leads' && (
            <>
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 h-8 text-[13px] font-medium transition-colors shadow-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add lead
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg px-3 h-8 text-[13px] font-medium transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
                Export
              </button>
            </>
          )}
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-700 text-[13px] transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {view === 'leads' ? (
        <>
          <FilterBar
            filters={filters}
            onChange={updateFilters}
            range={range}
            onRangeChange={updateRange}
            refreshing={refreshing}
            availableBrands={availableBrands}
            filteredCount={filteredLeads.length}
            totalCount={allLeads.length}
          />

          <Board
            leads={filteredLeads}
            loading={loading}
            error={error}
            onLeadUpdate={handleLeadUpdate}
            onLeadDelete={handleLeadDelete}
          />
        </>
      ) : (
        <NotifyMeView
          searchQuery={searchQuery}
          range={range}
          onRangeChange={updateRange}
        />
      )}

      {view === 'leads' && showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {view === 'leads' && showCreate && (
        <CreateLeadModal
          onClose={() => setShowCreate(false)}
          onCreated={(lead) => setAllLeads((prev) => [lead, ...prev])}
        />
      )}
    </div>
  )
}

function Tabs({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
      <TabButton active={view === 'leads'} onClick={() => onChange('leads')}>
        Leads
      </TabButton>
      <TabButton active={view === 'notify-me'} onClick={() => onChange('notify-me')}>
        Notify Me
      </TabButton>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 h-7 rounded-md text-[12px] font-medium transition-colors ${
        active
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}
