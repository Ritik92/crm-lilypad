'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Filters,
  AGE_OPTIONS,
  DEMO_OPTIONS,
  AgeFilter,
  DemoFilter,
  RangeFilter,
  RANGE_OPTIONS,
  DEFAULT_RANGE,
  hasActiveFilters,
} from '@/lib/filters'

interface Props {
  filters: Filters
  onChange: (next: Filters) => void
  range: RangeFilter
  onRangeChange: (next: RangeFilter) => void
  refreshing: boolean
  availableBrands: string[]
  filteredCount: number
  totalCount: number
}

export default function FilterBar({
  filters,
  onChange,
  range,
  onRangeChange,
  refreshing,
  availableBrands,
  filteredCount,
  totalCount,
}: Props) {
  const clear = () => onChange({ brands: [], age: null, demo: null })
  const active = hasActiveFilters(filters)

  return (
    <div className="bg-white border-b border-slate-200/80 px-5 h-[44px] flex items-center gap-2 sticky top-[57px] z-10">
      <SingleFilter
        label="Range"
        value={range === DEFAULT_RANGE ? DEFAULT_RANGE : range}
        options={RANGE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onChange={(v) => onRangeChange((v as RangeFilter) ?? DEFAULT_RANGE)}
        showNullOption={false}
        defaultValue={DEFAULT_RANGE}
      />

      <div className="h-5 w-px bg-slate-200 mx-1" />

      <BrandFilter
        value={filters.brands}
        available={availableBrands}
        onChange={(brands) => onChange({ ...filters, brands })}
      />
      <SingleFilter
        label="Age"
        value={filters.age}
        options={AGE_OPTIONS}
        onChange={(age) => onChange({ ...filters, age: age as AgeFilter })}
      />
      <SingleFilter
        label="Demo"
        value={filters.demo}
        options={DEMO_OPTIONS}
        onChange={(demo) => onChange({ ...filters, demo: demo as DemoFilter })}
      />

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
          {active ? (
            <>
              <span className="text-slate-900 font-medium">{filteredCount}</span>
              <span className="text-slate-400"> of {totalCount}</span>
            </>
          ) : (
            <>
              <span className="text-slate-900 font-medium">{totalCount}</span>
              <span className="text-slate-400"> leads</span>
            </>
          )}
        </span>
        {active && (
          <button
            onClick={clear}
            className="text-slate-500 hover:text-slate-900 text-[12px] font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}

// ----- Brand multi-select -----

function BrandFilter({
  value,
  available,
  onChange,
}: {
  value: string[]
  available: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useOutsideClick(ref, () => setOpen(false))

  const label =
    value.length === 0
      ? 'All brands'
      : value.length === 1
      ? value[0] === '__unknown__'
        ? 'Unknown'
        : value[0]
      : `${value.length} brands`

  const toggle = (brand: string) => {
    onChange(value.includes(brand) ? value.filter((b) => b !== brand) : [...value, brand])
  }

  return (
    <div className="relative" ref={ref}>
      <FilterButton active={value.length > 0} onClick={() => setOpen((v) => !v)}>
        <span className="text-slate-400 mr-1">Brand:</span>
        <span>{label}</span>
        <Chevron />
      </FilterButton>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[180px] max-h-[280px] overflow-y-auto crm-scroll z-30">
          {available.length === 0 ? (
            <div className="px-3 py-2 text-[12px] text-slate-400">No brands</div>
          ) : (
            available.map((brand) => {
              const selected = value.includes(brand)
              return (
                <button
                  key={brand}
                  onClick={() => toggle(brand)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-slate-700 hover:bg-slate-50 text-left"
                >
                  <span
                    className={`h-3.5 w-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                      selected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {selected && (
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6.5 5 9.5l5-7" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate">{brand === '__unknown__' ? 'Unknown' : brand}</span>
                </button>
              )
            })
          )}
          {value.length > 0 && (
            <div className="border-t border-slate-100 mt-1 pt-1">
              <button
                onClick={() => onChange([])}
                className="w-full px-3 py-1.5 text-[12px] text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-left"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ----- Single-select filter (Age, Demo) -----

function SingleFilter<T extends string | null>({
  label,
  value,
  options,
  onChange,
  showNullOption = true,
  defaultValue,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  showNullOption?: boolean
  defaultValue?: T
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useOutsideClick(ref, () => setOpen(false))

  const current = options.find((o) => o.value === value)
  const display = current?.label ?? 'All'
  const isActive =
    defaultValue !== undefined ? value !== defaultValue : value !== null

  return (
    <div className="relative" ref={ref}>
      <FilterButton active={isActive} onClick={() => setOpen((v) => !v)}>
        <span className="text-slate-400 mr-1">{label}:</span>
        <span>{display}</span>
        <Chevron />
      </FilterButton>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[150px] z-30">
          {showNullOption && (
            <button
              onClick={() => {
                onChange(null as T)
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-slate-50 ${
                value === null ? 'text-slate-900 font-medium' : 'text-slate-700'
              }`}
            >
              All
            </button>
          )}
          {options.map((o) => (
            <button
              key={String(o.value)}
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-slate-50 ${
                value === o.value ? 'text-slate-900 font-medium' : 'text-slate-700'
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

// ----- Primitives -----

function FilterButton({
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
      className={`inline-flex items-center h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors border ${
        active
          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 ml-1 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function useOutsideClick(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler()
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, handler])
}
