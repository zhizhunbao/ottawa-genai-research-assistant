/**
 * App - Root Application Component
 *
 * Routes: Home, Chat, Evaluation Dashboard.
 * Auth 通过 Modal 处理，无需单独路由。
 */

import { Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from '@/shared/components/ui'
import { MainLayout } from '@/shared/components/layout'
import { Suspense, lazy } from 'react'

// Views (lazy loaded)
const HomeView = lazy(() => import('@/features/home/views/HomeView'))
const ChatView = lazy(() => import('@/features/research/views/ChatView'))
const EvaluationView = lazy(() => import('@/features/research/views/EvaluationView'))

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
            <Route path="/" element={<HomeView />} />
            <Route path="/chat" element={<ChatView />} />
            <Route path="/evaluation" element={<EvaluationView />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
