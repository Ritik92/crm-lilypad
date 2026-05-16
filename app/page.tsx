'use client'

import { useState } from 'react'
import Board from '@/components/Board'
import SearchBar from '@/components/SearchBar'
import ExportModal from '@/components/ExportModal'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showExport, setShowExport] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 mr-auto">
          <span className="text-2xl">🌿</span>
          <span className="font-bold text-slate-800 text-lg tracking-tight">Lilypad CRM</span>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <button
          onClick={() => setShowExport(true)}
          className="border border-slate-200 text-slate-600 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Export CSV
        </button>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
        >
          Logout
        </button>
      </header>

      <Board searchQuery={searchQuery} />

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  )
}
