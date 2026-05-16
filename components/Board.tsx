'use client'

import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useState, useEffect, useCallback } from 'react'
import { Lead, LeadStatus, COLUMN_ORDER } from '@/lib/types'
import Column from '@/components/Column'
import LeadDetailModal from '@/components/LeadDetailModal'
import DemoScheduleModal from '@/components/DemoScheduleModal'

interface Props {
  searchQuery: string
}

export default function Board({ searchQuery }: Props) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [pendingMove, setPendingMove] = useState<{ leadId: string } | null>(null)

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => {
        if (!r.ok) { window.location.href = '/login'; return null }
        return r.json()
      })
      .then((data) => { if (data) { setLeads(data); setLoading(false) } })
  }, [])

  const query = searchQuery.toLowerCase()
  const visibleLeads = query
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.email.toLowerCase().includes(query) ||
          l.phone.toLowerCase().includes(query)
      )
    : leads

  const getColumnLeads = (status: LeadStatus) =>
    visibleLeads.filter((l) => l.status === status)

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, destination } = result
      if (!destination) return

      const newStatus = destination.droppableId as LeadStatus
      const lead = leads.find((l) => l.id === draggableId)
      if (!lead || lead.status === newStatus) return

      if (newStatus === 'HOME_DEMO_SCHEDULED') {
        setPendingMove({ leadId: draggableId })
        return
      }

      setLeads((prev) =>
        prev.map((l) => (l.id === draggableId ? { ...l, status: newStatus } : l))
      )
      try {
        const res = await fetch(`/api/leads/${draggableId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) throw new Error()
        const updated: Lead = await res.json()
        setLeads((prev) => prev.map((l) => (l.id === draggableId ? updated : l)))
      } catch {
        setLeads((prev) =>
          prev.map((l) => (l.id === draggableId ? { ...l, status: lead.status } : l))
        )
      }
    },
    [leads]
  )

  const handleDemoConfirm = async (demoDate: string) => {
    if (!pendingMove) return
    const { leadId } = pendingMove
    const lead = leads.find((l) => l.id === leadId)
    if (!lead) return
    setPendingMove(null)

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, status: 'HOME_DEMO_SCHEDULED' as LeadStatus, demoDate }
          : l
      )
    )
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'HOME_DEMO_SCHEDULED', demoDate }),
      })
      if (!res.ok) throw new Error()
      const updated: Lead = await res.json()
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)))
    } catch {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, status: lead.status, demoDate: lead.demoDate }
            : l
        )
      )
    }
  }

  const handleLeadUpdate = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
    if (selectedLead?.id === updated.id) setSelectedLead(updated)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">Loading pipeline…</p>
      </div>
    )
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className="flex gap-3 p-4 overflow-x-auto pb-6"
          style={{ minHeight: 'calc(100vh - 61px)' }}
        >
          {COLUMN_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              leads={getColumnLeads(status)}
              onCardClick={setSelectedLead}
            />
          ))}
        </div>
      </DragDropContext>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}

      {pendingMove && (
        <DemoScheduleModal
          onConfirm={handleDemoConfirm}
          onCancel={() => setPendingMove(null)}
        />
      )}
    </>
  )
}
