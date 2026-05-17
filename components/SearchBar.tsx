'use client'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder="Search name, email, phone…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-8 h-8 border border-slate-200 hover:border-slate-300 rounded-lg text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 w-72 bg-slate-50/60 focus:bg-white transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-lg leading-none w-5 h-5 flex items-center justify-center"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}
