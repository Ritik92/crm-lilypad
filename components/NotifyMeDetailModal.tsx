'use client'

import { useState } from 'react'
import { NotifyMeRequest, COLUMN_LABELS } from '@/lib/types'

interface Props {
  request: NotifyMeRequest
  onClose: () => void
  onUpdate: (request: NotifyMeRequest) => void
  onDelete: (requestId: number) => void
}

const STATUS_DOT: Record<NotifyMeRequest['crmStatus'], string> = {
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

export default function NotifyMeDetailModal({ request, onClose, onUpdate, onDelete }: Props) {
  const [notes, setNotes] = useState(request.crmNotes ?? '')
  const [savedNotes, setSavedNotes] = useState(request.crmNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isDirty = notes !== savedNotes

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/notify-me/${request.id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Delete failed (${res.status})`)
      }
      onDelete(request.id)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Delete failed')
      setDeleting(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!isDirty || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/notify-me/${request.id}`, {
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

  const fullAddress = [request.address, request.pincode].filter(Boolean).join(' · ')
  const productLine = [request.productName, request.variantName, request.colorName]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <div className="fixed inset-0 z-50 flex" onClick={onClose}>
        <div className="flex-1 bg-slate-900/30 backdrop-blur-[2px]" />
        <div
          className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto crm-scroll"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold text-slate-900 truncate leading-tight">
                {request.fullName}
              </h2>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[request.crmStatus]}`} />
                <p className="text-[12px] text-slate-500">{COLUMN_LABELS[request.crmStatus]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setConfirmingDelete(true)
                  setDeleteError(null)
                }}
                className="inline-flex items-center h-7 px-3 rounded-md bg-red-600 hover:bg-red-700 text-white text-[12px] font-semibold transition-colors shadow-sm"
              >
                Delete
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md w-7 h-7 flex items-center justify-center text-xl leading-none -mr-1 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="px-6 py-5 space-y-3.5 border-b border-slate-100">
            <Section title="Contact">
              <InfoField label="Phone" value={request.phoneNumber} mono />
              <InfoField label="Email" value={request.email ?? '—'} />
              <InfoField label="Address" value={fullAddress || '—'} />
            </Section>
          </div>

          {/* Product */}
          <div className="px-6 py-5 space-y-3.5 border-b border-slate-100">
            <Section title="Product">
              <InfoField label="Interested in" value={productLine || '—'} />
            </Section>
          </div>

          {/* Submission */}
          <div className="px-6 py-5 space-y-3.5 border-b border-slate-100">
            <Section title="Submission">
              <InfoField
                label="Submitted"
                value={new Date(request.createdAt).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              />
              {request.confirmedDemoAt && (
                <InfoField
                  label="Demo confirmed for"
                  value={new Date(request.confirmedDemoAt).toLocaleString('en-US', {
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
              placeholder="Add notes about this request…"
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
                <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">
                  ⌘ Enter
                </kbd>{' '}
                to save
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

      {confirmingDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-[3px] px-4"
          onClick={() => {
            if (deleting) return
            setConfirmingDelete(false)
            setDeleteError(null)
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                <TrashIcon />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-slate-900">Delete this request?</h2>
                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed break-words">
                  {request.fullName} will be removed from the board.
                </p>
              </div>
            </div>

            {deleteError && <p className="text-red-600 text-[12px] mb-3">{deleteError}</p>}

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => {
                  setConfirmingDelete(false)
                  setDeleteError(null)
                }}
                disabled={deleting}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg h-9 text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg h-9 text-[13px] font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Spinner />
                    Deleting…
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  if (error) return <span className="text-[11px] text-red-600">{error}</span>
  if (saving) return <span className="text-[11px] text-slate-400">Saving…</span>
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

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}
