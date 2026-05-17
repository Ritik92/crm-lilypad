'use client'

import { useState } from 'react'
import { Lead, COLUMN_LABELS } from '@/lib/types'

interface Props {
  lead: Lead
  onClose: () => void
  onUpdate: (lead: Lead) => void
}

function formatTimeSlot(slot: Lead['timeSlot']) {
  if (slot === 'MORNING') return 'Morning (10 AM – 12 PM)'
  if (slot === 'EVENING') return 'Evening (4 PM – 6 PM)'
  return '—'
}

const STATUS_DOT: Record<Lead['crmStatus'], string> = {
  LEAD: 'bg-slate-400',
  NOT_RESPONDING: 'bg-orange-500',
  CALL_BACK: 'bg-yellow-500',
  INTERESTED: 'bg-blue-500',
  FIRST_FOLLOW_UP: 'bg-cyan-500',
  SECOND_FOLLOW_UP: 'bg-teal-500',
  NOT_INTERESTED: 'bg-red-500',
  HOME_DEMO_SCHEDULED: 'bg-purple-500',
  HOME_DEMO_COMPLETED: 'bg-indigo-500',
  SALE: 'bg-emerald-500',
}

export default function LeadDetailModal({ lead, onClose, onUpdate }: Props) {
  const [notes, setNotes] = useState(lead.crmNotes ?? '')
  const [savedNotes, setSavedNotes] = useState(lead.crmNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const isDirty = notes !== savedNotes

  const handleSaveNotes = async () => {
    if (!isDirty || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) throw new Error(`Save failed (${res.status})`)
      const updated = await res.json()
      onUpdate(updated)
      setSavedNotes(updated.crmNotes ?? '')
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const fullAddress = [lead.addressLine, lead.pincode].filter(Boolean).join(' · ')

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-slate-900/30 backdrop-blur-[2px]" />
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto crm-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold text-slate-900 truncate leading-tight">{lead.fullName}</h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[lead.crmStatus]}`} />
              <p className="text-[12px] text-slate-500">{COLUMN_LABELS[lead.crmStatus]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md w-7 h-7 flex items-center justify-center text-xl leading-none flex-shrink-0 -mr-1 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Contact Info */}
        <div className="px-6 py-5 space-y-3.5 border-b border-slate-100">
          <Section title="Contact">
            <InfoField label="Phone" value={lead.mobileNumber} mono />
            <InfoField label="Email" value={lead.email ?? '—'} />
            <InfoField label="Address" value={fullAddress || '—'} />
          </Section>
        </div>

        <div className="px-6 py-5 space-y-3.5 border-b border-slate-100">
          <Section title="Product">
            <InfoField
              label="Model"
              value={[lead.productName, lead.productBrand].filter(Boolean).join(' · ') || '—'}
            />
          </Section>
        </div>

        <div className="px-6 py-5 space-y-3.5 border-b border-slate-100">
          <Section title="Booking">
            <InfoField label="Status" value={lead.bookingStatus} />
            <InfoField
              label="Created"
              value={new Date(lead.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            />
            {lead.demoDate && (
              <InfoField
                label="Customer requested"
                value={`${new Date(lead.demoDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })} · ${formatTimeSlot(lead.timeSlot)}`}
              />
            )}
            {lead.confirmedDemoAt && (
              <InfoField
                label="Demo confirmed for"
                value={new Date(lead.confirmedDemoAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                highlight
              />
            )}
          </Section>
        </div>

        {/* Notes */}
        <div className="px-6 py-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em]">
              Notes
            </label>
            <NotesStatus saving={saving} isDirty={isDirty} error={saveError} />
          </div>
          <textarea
            className="crm-scroll flex-1 min-h-[180px] border border-slate-200 hover:border-slate-300 rounded-lg p-3 text-[13px] text-slate-700 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-colors"
            placeholder="Add notes about this lead…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                handleSaveNotes()
              }
            }}
          />
          <div className="flex items-center justify-between mt-3 gap-3">
            <p className="text-[11px] text-slate-400">
              <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">⌘ Enter</kbd> to save
            </p>
            <div className="flex items-center gap-2">
              {isDirty && !saving && (
                <button
                  onClick={() => setNotes(savedNotes)}
                  className="text-[12px] text-slate-500 hover:text-slate-900 px-2 h-8 transition-colors"
                >
                  Discard
                </button>
              )}
              <button
                onClick={handleSaveNotes}
                disabled={!isDirty || saving}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-semibold transition-colors disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-200 disabled:text-slate-400 shadow-sm disabled:shadow-none"
              >
                {saving ? (
                  <>
                    <Spinner />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] mb-3">
        {title}
      </p>
      <div className="space-y-3.5">{children}</div>
    </>
  )
}

function InfoField({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 font-medium">{label}</p>
      <p
        className={`text-[13px] mt-0.5 break-words ${
          highlight ? 'text-purple-700 font-medium' : 'text-slate-800'
        } ${mono ? 'font-mono tabular-nums' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}

function NotesStatus({
  saving,
  isDirty,
  error,
}: {
  saving: boolean
  isDirty: boolean
  error: string | null
}) {
  if (error) {
    return <span className="text-[11px] text-red-600">{error}</span>
  }
  if (saving) {
    return <span className="text-[11px] text-slate-400">Saving…</span>
  }
  if (isDirty) {
    return (
      <span className="flex items-center gap-1 text-[11px] text-amber-600">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Unsaved
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-[11px] text-slate-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Saved
    </span>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
