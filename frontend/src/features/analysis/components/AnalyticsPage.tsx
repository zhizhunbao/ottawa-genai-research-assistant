/**
 * 分析页面组件
 *
 * 展示图表可视化和文字总结结果。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { useTranslation } from 'react-i18next'
import { BarChart3, FileText, Download, Share2, TrendingUp, Users, MessageSquare } from 'lucide-react'
import type { ChartData, SpeakingNotes, AnalysisType } from '../types'
import { ANALYSIS_TYPES } from '../constants'
import { StatsCard } from '@/shared/components/ui/StatsCard'

interface AnalyticsPageProps {
  isLoading: boolean
  error: string | null
  chartData: ChartData | null
  speakingNotes: SpeakingNotes | null
  onAnalyze: (query: string, type: AnalysisType) => void
}

export function AnalyticsPage({
  isLoading,
  error,
  chartData,
  speakingNotes,
  onAnalyze,
}: AnalyticsPageProps) {
  const { t } = useTranslation('analysis')

  if (error) {
    console.error('Analytics Error:', error)
  }

  const mockStats = [
    { label: t('stats.businesses', 'Total Businesses'), value: '12,482', change: '+2.4%', changeType: 'positive', Icon: TrendingUp, color: 'indigo' },
    { label: t('stats.employment', 'Total Employment'), value: '452K', change: '+1.2%', changeType: 'positive', Icon: Users, color: 'blue' },
    { label: t('stats.reports', 'Indexed Reports'), value: '48', change: 'New', changeType: 'neutral', Icon: FileText, color: 'slate' },
    { label: t('stats.queries', 'AI Queries'), value: '1,205', change: '+15%', changeType: 'positive', Icon: MessageSquare, color: 'purple' },
  ] as const

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white shadow-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
            <Share2 className="w-4 h-4" /> {t('actions.share')}
          </button>
          <button
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-soft font-bold rounded-xl hover:shadow-glow transition-all"
          >
            <Download className="w-4 h-4" /> {t('actions.export')}
          </button>
        </div>
      </header>

      {/* 核心指标卡片 (从旧版 Dashboard 迁移) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockStats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* 搜索/分析触发区 */}
          <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 ring-1 ring-black/[0.02]">
            <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              {t('startAnalysis.title')}
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                className="flex-1 px-5 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                placeholder={t('startAnalysis.placeholder')}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => onAnalyze('test', ANALYSIS_TYPES.CHART)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-soft hover:bg-indigo-700 transition-all flex-1 sm:flex-none"
                >
                  {t('startAnalysis.chartButton')}
                </button>
                <button
                  onClick={() => onAnalyze('test', ANALYSIS_TYPES.SPEAKING_NOTES)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-soft hover:bg-black transition-all flex-1 sm:flex-none"
                >
                  {t('startAnalysis.notesButton')}
                </button>
              </div>
            </div>
          </div>

          {/* 展示区 */}
          <div className="grid grid-cols-1 gap-8">
            {/* 图表展示区 */}
            <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 min-h-[450px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-indigo-600">
                  <BarChart3 className="w-6 h-6" />
                  <h2 className="text-xl font-bold text-gray-900">{t('sections.visualizations')}</h2>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex-1 bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center">
                  <div className="text-indigo-300 animate-spin"><TrendingUp className="w-12 h-12" /></div>
                </div>
              ) : chartData ? (
                <div className="flex-1 border-2 border-dashed border-indigo-100 rounded-2xl flex items-center justify-center p-8 bg-indigo-50/10 group hover:bg-indigo-50/30 transition-colors">
                   <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-indigo-200 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                      <p className="text-lg font-bold text-indigo-900">{chartData.title}</p>
                      <p className="text-sm text-indigo-600 mt-2 opacity-60 italic">[ Chart Engine Loading... ]</p>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                  <BarChart3 className="w-16 h-16 mb-4 opacity-10" />
                  <p className="font-medium">{t('empty.chart')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 侧边展示区 / 发言稿 (集成旧版布局) */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 min-h-[500px] flex flex-col sticky top-8">
              <div className="flex items-center gap-3 text-purple-600 mb-8">
                <FileText className="w-6 h-6" />
                <h2 className="text-xl font-bold text-gray-900">{t('sections.speakingNotes', 'Insights Summary')}</h2>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-slate-100 rounded w-3/4 animate-pulse" />
                  <div className="space-y-2">
                     <div className="h-4 bg-slate-100 rounded animate-pulse" />
                     <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6" />
                     <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ) : speakingNotes ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight border-l-4 border-purple-500 pl-4">
                    {speakingNotes.title}
                  </h3>
                  <ul className="space-y-3">
                    {speakingNotes.keyPoints.map((point, i) => (
                      <li key={i} className="flex gap-3 text-gray-700 leading-relaxed group">
                        <span className="text-purple-500 font-bold group-hover:scale-125 transition-transform">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                      {t('stats.title')}
                    </h4>
                    <div className="space-y-3">
                      {speakingNotes.statistics.map((stat, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                           <span className="text-sm font-medium text-slate-700">{stat.split(':')[0]}</span>
                           <span className="text-sm font-bold text-purple-600">{stat.split(':')[1] || '---'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute top-0 left-0 text-slate-100 text-6xl font-serif -z-10 select-none">“</div>
                    <p className="text-slate-600 italic leading-relaxed pt-2 pl-4">{speakingNotes.conclusion}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                  <FileText className="w-16 h-16 mb-4 opacity-10" />
                  <p className="font-medium">{t('empty.notes')}</p>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  )
}
