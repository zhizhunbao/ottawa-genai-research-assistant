/**
 * 首页组件
 *
 * 研究助手的着陆页 UI，展示产品介绍、功能特性和使用流程。
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, BarChart3, FileText, CheckCircle, Building2, ArrowRight } from 'lucide-react'

interface HomePageProps {
  isAuthenticated: boolean
  user?: {
    displayName?: string
    email?: string
  } | null
}

const FEATURES = [
  { key: 'qa', Icon: Search },
  { key: 'visualization', Icon: BarChart3 },
  { key: 'speakingNotes', Icon: FileText },
  { key: 'sources', Icon: CheckCircle },
] as const

export function HomePage({ isAuthenticated, user }: HomePageProps) {
  const { t } = useTranslation('home')
  const { t: tCommon } = useTranslation('common')

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50">
      {/* Hero */}
      <header className="relative min-h-[80vh] flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-200/50 to-purple-200/50 animate-float" />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-gradient-to-br from-pink-200/50 to-red-200/50 animate-float" style={{ animationDirection: 'reverse', animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Ottawa{' '}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              GenAI
            </span>{' '}
            Research Assistant
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <Link to="/chat" className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl shadow-soft hover:shadow-glow transition-all hover:-translate-y-0.5">
                  {t('cta.startChat')}
                </Link>
                <span className="text-gray-500">{t('welcome.back', { name: user?.displayName || user?.email })}</span>
              </>
            ) : (
              <>
                <Link to="/login" className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl shadow-soft hover:shadow-glow transition-all hover:-translate-y-0.5">
                  {t('cta.signIn')}
                </Link>
                <a href="#features" className="px-8 py-4 bg-white/50 backdrop-blur border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all">
                  {t('cta.learnMore')}
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">{t('features.sectionTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ key, Icon }) => (
              <article key={key} className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-lg hover:-translate-y-2 transition-all duration-300">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t(`features.${key}.title`)}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{t(`features.${key}.description`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">{t('howItWorks.sectionTitle')}</h2>
          <div className="flex flex-col md:flex-row justify-center items-start gap-8">
            {[1, 2, 3].map((num, index) => (
              <div key={num} className="flex items-start gap-4 max-w-xs">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
                  {num}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t(`howItWorks.step${num}.title`)}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t(`howItWorks.step${num}.description`)}</p>
                </div>
                {index < 2 && <ArrowRight className="hidden md:block w-6 h-6 text-primary-500 self-center ml-4 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('cta.title')}</h2>
          <p className="text-white/90 text-lg mb-8">{t('cta.subtitle')}</p>
          <Link to={isAuthenticated ? '/chat' : '/login'} className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-white/90 transition-all shadow-lg">
            {isAuthenticated ? t('cta.startChat') : t('cta.getStarted')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6" />
            <span className="font-semibold">{tCommon('footer.organization')}</span>
          </div>
          <p className="text-gray-400 text-sm">{tCommon('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
