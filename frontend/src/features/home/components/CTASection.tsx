/**
 * CTASection - 底部行动呼吁区
 *
 * 遵循 dev-frontend_patterns 规范。
 */

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { MessageSquare, Upload } from 'lucide-react'

interface CTASectionProps {
  isAuthenticated: boolean
}

export function CTASection({ isAuthenticated }: CTASectionProps) {
  const { t } = useTranslation('home')

  return (
    <section className="py-24 px-6 relative bg-white overflow-hidden">
      {/* 装饰性背景 */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-slate-50 z-0" />
      
      <div className="max-w-6xl mx-auto rounded-[3rem] p-16 bg-linear-to-br from-[#004890] to-[#0066cc] relative z-10 overflow-hidden shadow-2xl shadow-blue-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] z-0" />
        
        <div className="relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            {t('cta.title')}
          </h2>
          <p className="text-white/80 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('cta.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to={isAuthenticated ? '/chat' : '/login'} className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-5 bg-white text-[#004890] font-bold rounded-2xl hover:scale-105 transition-all shadow-xl cursor-pointer no-underline hover:no-underline">
              <MessageSquare size={20} />
              {isAuthenticated ? t('cta.startChat') : t('cta.startSession')}
            </Link>
            
            <Link to="/documents/upload" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-5 bg-transparent border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/10 transition-all cursor-pointer no-underline hover:no-underline">
              <Upload size={20} />
              {t('cta.uploadDocs')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
