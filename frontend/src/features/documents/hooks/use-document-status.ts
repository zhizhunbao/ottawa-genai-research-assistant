/**
 * useDocumentStatus - Polls backend for document processing status updates
 *
 * @module features/documents/hooks
 * @template none
 * @reference none
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { documentApi, type DocumentStatusValue } from '../services/document-api'

const POLL_INTERVAL_MS = 3000

interface StatusUpdate {
  id: string
  status: DocumentStatusValue
}

interface UseDocumentStatusOptions {
  /** Document IDs to track */
  documentIds: string[]
  /** Whether polling is enabled */
  enabled?: boolean
  /** Callback when a document finishes processing */
  onStatusChange?: (update: StatusUpdate) => void
}

/**
 * Tracks the processing status of multiple documents via polling.
 */
export function useDocumentStatus({
  documentIds,
  enabled = true,
  onStatusChange,
}: UseDocumentStatusOptions) {
  const [statuses, setStatuses] = useState<Record<string, DocumentStatusValue>>({})
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onStatusChangeRef = useRef(onStatusChange)
  onStatusChangeRef.current = onStatusChange

  // IDs that need polling (pending or processing)
  const activeIds = documentIds.filter(
    (id) => !statuses[id] || statuses[id] === 'pending' || statuses[id] === 'processing'
  )

  const poll = useCallback(async () => {
    if (activeIds.length === 0) return

    const results = await Promise.allSettled(
      activeIds.map((id) => documentApi.getDocumentStatus(id))
    )

    const updates: Record<string, DocumentStatusValue> = {}
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        const { id, status } = result.value
        updates[id] = status

        // Notify on terminal status change
        const prevStatus = statuses[activeIds[i]]
        if (prevStatus !== status && (status === 'indexed' || status === 'failed')) {
          onStatusChangeRef.current?.({ id, status })
        }
      }
    })

    if (Object.keys(updates).length > 0) {
      setStatuses((prev) => ({ ...prev, ...updates }))
    }
  }, [activeIds, statuses])

  // Start / stop polling
  useEffect(() => {
    if (!enabled || activeIds.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsPolling(false)
      return
    }

    setIsPolling(true)

    // Initial check
    poll()

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, activeIds.length, poll])

  return {
    statuses,
    isPolling,
    /** Force refresh status for all tracked documents */
    refresh: poll,
  }
}

export default useDocumentStatus
