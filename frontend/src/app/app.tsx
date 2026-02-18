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
import { ComingSoon } from '@/features/admin/shared/coming-soon'

// Views (lazy loaded) — unified Research module
const ResearchView = lazy(() => import('@/features/research/views/research-view'))
const StrategyLab = lazy(() => import('@/features/research/components/strategy/strategy-lab'))

// Admin views (lazy loaded)
const AdminConsole = lazy(() => import('@/features/admin/views/admin-console'))
const AdminDashboard = lazy(() => import('@/features/admin/views/admin-dashboard'))
const LLMModelManager = lazy(() => import('@/features/admin/modules/llm-models/components/llm-model-manager'))
const DataSourceManager = lazy(() => import('@/features/admin/modules/datasources/components/datasource-manager'))
const PromptStudio = lazy(() => import('@/features/admin/modules/prompt-studio/components/prompt-studio'))
const EmbeddingModelManager = lazy(() => import('@/features/admin/modules/embedding-models/components/embedding-model-manager'))
const SearchEngineManager = lazy(() => import('@/features/admin/modules/search-engines/components/search-engine-manager'))
const EvaluationCenter = lazy(() => import('@/features/admin/modules/evaluation/components/evaluation-center'))
const ChartTemplateManager = lazy(() => import('@/features/admin/modules/chart-templates/components/chart-template-manager'))
const CitationConfig = lazy(() => import('@/features/admin/modules/citations/components/citation-config'))
const SystemSettings = lazy(() => import('@/features/admin/modules/settings/components/system-settings'))
const AnalyticsDashboard = lazy(() => import('@/features/admin/modules/analytics/components/analytics-dashboard'))
const FeedbackAdmin = lazy(() => import('@/features/admin/modules/feedback/components/feedback-admin'))

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
            <Route path="/" element={<Navigate to="/research" replace />} />
            <Route path="/research" element={<ResearchView />} />
            <Route path="/strategy-lab" element={<Navigate to="/admin/benchmark" replace />} />

            {/* Admin Console */}
            <Route path="/admin" element={<AdminConsole />}>
              <Route index element={<AdminDashboard />} />
              <Route path="datasources" element={<DataSourceManager />} />
              <Route path="llm-models" element={<LLMModelManager />} />
              <Route path="embedding-models" element={<EmbeddingModelManager />} />
              <Route path="search-engines" element={<SearchEngineManager />} />
              <Route path="prompt-studio" element={<PromptStudio />} />
              <Route path="chart-templates" element={<ChartTemplateManager />} />
              <Route path="citations" element={<CitationConfig />} />
              <Route path="evaluation" element={<EvaluationCenter />} />
              <Route path="benchmark" element={<StrategyLab />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="feedback" element={<FeedbackAdmin />} />
              <Route path="users" element={<ComingSoon title="Users & Roles" description="Manage user accounts, role assignments, and access control." />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>

            {/* Backward compatibility redirects */}
            <Route path="/chat" element={<Navigate to="/research" replace />} />
            <Route path="/documents" element={<Navigate to="/research" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
