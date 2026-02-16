/**
 * App - Root application component with routing and layout configuration
 *
 * @module app
 * @template none
 * @reference none
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@/shared/components/ui'
import { MainLayout } from '@/shared/components/layout'
import { Suspense, lazy } from 'react'

// Views (lazy loaded)
const ChatView = lazy(() => import('@/features/chat/views/chat-view'))
const LibraryView = lazy(() => import('@/features/documents/views/library-view'))

// Loading component
function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatView />} />
            <Route path="/documents" element={<LibraryView />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

