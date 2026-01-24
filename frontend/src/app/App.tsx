/**
 * App - Root Application Component
 *
 * Application entry point with routing and global providers.
 * Follows dev-frontend_patterns skill conventions.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from '@/shared/components/ui/ErrorBoundary'
import { Suspense, lazy } from 'react'

// Views (lazy loaded) - using View suffix naming convention
const HomeView = lazy(() => import('@/features/research/views/HomeView'))
const ChatView = lazy(() => import('@/features/research/views/ChatView'))
const LoginView = lazy(() => import('@/features/auth/views/LoginView'))
const DocumentsView = lazy(() => import('@/features/documents/views/DocumentsView'))
const DocumentUploadView = lazy(() => import('@/features/documents/views/DocumentUploadView'))
const SettingsView = lazy(() => import('@/features/settings/views/SettingsView'))

// Loading component
function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/chat" element={<ChatView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/documents" element={<DocumentsView />} />
            <Route path="/documents/upload" element={<DocumentUploadView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

