'use client'

import { useState, useRef } from 'react'
import { Lead, COLUMN_LABELS, PRODUCTS } from '@/lib/types'

interface Props {
  lead: Lead
  onClose: () => void
  onUpdate: (lead: Lead) => void
}

export default function LeadDetailModal({ lead, onClose, onUpdate }: Props) {
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [product, setProduct] = useState(lead.product ?? '')
  const [saving, setSaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const patchLead = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) onUpdate(await res.json())
    } finally {
      setSaving(false)
    }
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => patchLead({ notes: value }), 800)
  }

  const handleProductChange = (value: string) => {
    setProduct(value)
    patchLead({ product: value || null })
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-800 truncate">{lead.name}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{COLUMN_LABELS[lead.status]}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none flex-shrink-0 mt-0.5"
          >
            ×
          </button>
        </div>

        {/* Contact Info */}
        <div className="p-6 space-y-4 border-b border-slate-100">
          <InfoField label="Email" value={lead.email} />
          <InfoField label="Phone" value={lead.phone} />
          <InfoField label="Address" value={lead.address} />
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Product</p>
            <select
              value={product}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white"
            >
              <option value="">— Not set —</option>
              {PRODUCTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <InfoField
            label="Lead Created"
            value={new Date(lead.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          />
          {lead.demoDate && (
            <InfoField
              label="Demo Scheduled"
              value={new Date(lead.demoDate).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            />
          )}
        </div>

        {/* Notes */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Notes</label>
            {saving && <span className="text-xs text-slate-400">Saving…</span>}
          </div>
          <textarea
            className="flex-1 min-h-[200px] border border-slate-200 rounded-lg p-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
            placeholder="Add notes about this lead…"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5">{value}</p>
    </div>
  )
}
