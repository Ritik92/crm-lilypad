'use client'

import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useState, useCallback } from 'react'
import { Lead, LeadStatus, COLUMN_ORDER } from '@/lib/types'
import Column from '@/components/Column'
import LeadDetailModal from '@/components/LeadDetailModal'
import DemoScheduleModal from '@/components/DemoScheduleModal'
import BoardSkeleton from '@/components/BoardSkeleton'

interface Props {
  leads: Lead[]
  loading: boolean
  error: string | null
  onLeadUpdate: (lead: Lead) => void
  onLeadDelete: (leadId: number) => void
}

export default function Board({ leads, loading, error, onLeadUpdate, onLeadDelete }: Props) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [pendingMove, setPendingMove] = useState<{ leadId: number } | null>(null)

  const getColumnLeads = (status: LeadStatus) => leads.filter((l) => l.crmStatus === status)

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, destination } = result
      if (!destination) return

      const newStatus = destination.droppableId as LeadStatus
      const leadId = Number(draggableId)
      const lead = leads.find((l) => l.id === leadId)
      if (!lead || lead.crmStatus === newStatus) return

      if (newStatus === 'HOME_DEMO_SCHEDULED') {
        setPendingMove({ leadId })
        return
      }

      // Optimistic
      const original = lead
      onLeadUpdate({ ...lead, crmStatus: newStatus })

      try {
        const res = await fetch(`/api/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) throw new Error()
        onLeadUpdate(await res.json())
      } catch {
        onLeadUpdate(original)
      }
    },
    [leads, onLeadUpdate]
  )

  const handleDemoConfirm = async (confirmedDemoAt: string) => {
    if (!pendingMove) return
    const { leadId } = pendingMove
    const lead = leads.find((l) => l.id === leadId)
    if (!lead) return
    setPendingMove(null)

    const original = lead
    onLeadUpdate({
      ...lead,
      crmStatus: 'HOME_DEMO_SCHEDULED' as LeadStatus,
      confirmedDemoAt,
    })

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'HOME_DEMO_SCHEDULED', confirmedDemoAt }),
      })
      if (!res.ok) throw new Error()
      onLeadUpdate(await res.json())
    } catch {
      onLeadUpdate(original)
    }
  }

  if (loading) {
    return <BoardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 px-6">
        <div className="max-w-2xl text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load leads</p>
          <pre className="text-xs text-slate-600 bg-slate-100 rounded p-3 whitespace-pre-wrap text-left">
            {error}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className="crm-scroll flex items-start gap-3 px-4 pt-4 pb-3 overflow-auto"
          style={{ height: 'calc(100vh - 57px - 44px)' }}
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
          onUpdate={(updated) => {
            onLeadUpdate(updated)
            setSelectedLead(updated)
          }}
          onDelete={(leadId) => {
            onLeadDelete(leadId)
            setSelectedLead(null)
          }}
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
