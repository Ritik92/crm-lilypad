'use client'

import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useState, useCallback } from 'react'
import { NotifyMeRequest, LeadStatus, COLUMN_ORDER } from '@/lib/types'
import NotifyMeColumn from '@/components/NotifyMeColumn'
import NotifyMeDetailModal from '@/components/NotifyMeDetailModal'
import DemoScheduleModal from '@/components/DemoScheduleModal'
import BoardSkeleton from '@/components/BoardSkeleton'

interface Props {
  requests: NotifyMeRequest[]
  loading: boolean
  error: string | null
  onRequestUpdate: (request: NotifyMeRequest) => void
  onRequestDelete: (requestId: number) => void
}

export default function NotifyMeBoard({
  requests,
  loading,
  error,
  onRequestUpdate,
  onRequestDelete,
}: Props) {
  const [selected, setSelected] = useState<NotifyMeRequest | null>(null)
  const [pendingMove, setPendingMove] = useState<{ requestId: number } | null>(null)

  const getColumnRequests = (status: LeadStatus) =>
    requests.filter((r) => r.crmStatus === status)

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, destination } = result
      if (!destination) return

      const newStatus = destination.droppableId as LeadStatus
      const requestId = Number(draggableId)
      const request = requests.find((r) => r.id === requestId)
      if (!request || request.crmStatus === newStatus) return

      if (newStatus === 'HOME_DEMO_SCHEDULED') {
        setPendingMove({ requestId })
        return
      }

      const original = request
      onRequestUpdate({ ...request, crmStatus: newStatus })

      try {
        const res = await fetch(`/api/notify-me/${requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
        if (!res.ok) throw new Error()
        onRequestUpdate(await res.json())
      } catch {
        onRequestUpdate(original)
      }
    },
    [requests, onRequestUpdate]
  )

  const handleDemoConfirm = async (confirmedDemoAt: string) => {
    if (!pendingMove) return
    const { requestId } = pendingMove
    const request = requests.find((r) => r.id === requestId)
    if (!request) return
    setPendingMove(null)

    const original = request
    onRequestUpdate({
      ...request,
      crmStatus: 'HOME_DEMO_SCHEDULED' as LeadStatus,
      confirmedDemoAt,
    })

    try {
      const res = await fetch(`/api/notify-me/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'HOME_DEMO_SCHEDULED', confirmedDemoAt }),
      })
      if (!res.ok) throw new Error()
      onRequestUpdate(await res.json())
    } catch {
      onRequestUpdate(original)
    }
  }

  if (loading) {
    return <BoardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 px-6">
        <div className="max-w-2xl text-center">
          <p className="text-red-600 font-semibold mb-2">Failed to load notify-me requests</p>
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
            <NotifyMeColumn
              key={status}
              status={status}
              requests={getColumnRequests(status)}
              onCardClick={setSelected}
            />
          ))}
        </div>
      </DragDropContext>

      {selected && (
        <NotifyMeDetailModal
          request={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            onRequestUpdate(updated)
            setSelected(updated)
          }}
          onDelete={(requestId) => {
            onRequestDelete(requestId)
            setSelected(null)
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
