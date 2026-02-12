/**
 * Global Footer Component
 *
 * Displays copyright, organization branding, and essential resource links.
 * Inspired by the City of Ottawa visual identity.
 *
 * @template C1 frontend/shared/components/layout/Footer.tsx — Global Footer Layout
 */

import { useTranslation } from 'react-i18next'
import { Mail, Globe, ExternalLink, Shield, Accessibility, Info } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation('common')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#f8fafc] border-t border-[#e2e8f0] pt-16 pb-8 px-6 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Mission - 与 Header 保持一致 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-linear-to-br from-[#004890] to-[#0066cc] rounded-lg flex items-center justify-center text-xl shadow-[0_4px_12px_rgba(0,72,144,0.2)]">
                🍁
              </div>
              <span className="font-bold text-[1.25rem] text-[#004890] tracking-tight">
                {t('app.name')}
              </span>
            </div>
            <p className="text-[#64748b] max-w-md leading-relaxed text-[1rem] font-medium mb-8">
              {t('footer.mission', "An AI-powered research assistant helping the Economic Development team quickly gain insights and generate reports.")}
            </p>
            <div className="flex gap-4">
              <a href="mailto:info@ottawa.ca" className="w-10 h-10 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#004890] hover:border-[#004890] transition-all shadow-sm">
                <Mail size={18} />
              </a>
              <a href="https://ottawa.ca" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748b] hover:text-[#004890] hover:border-[#004890] transition-all shadow-sm">
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* Resources - 复刻常用链接 */}
          <div>
            <h4 className="font-bold text-[#1e293b] mb-6 tracking-wider text-xs">
              {t('footer.resources')}
            </h4>
            <ul className="space-y-4 text-[#64748b] text-[0.875rem] font-semibold">
              <li>
                <a href="https://ottawa.ca" target="_blank" rel="noopener noreferrer" className="hover:text-[#004890] transition-colors flex items-center gap-2 group">
                  Ottawa.ca <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#004890] transition-colors flex items-center gap-2 group">
                  {t('footer.openData', 'Open Data Portal')} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#004890] transition-colors flex items-center gap-2 group">
                  {t('footer.economicDev', 'Economic Development')} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance & Contact */}
          <div>
            <h4 className="font-bold text-[#1e293b] mb-6 tracking-wider text-xs">
              {t('footer.support')}
            </h4>
            <ul className="space-y-4 text-[#64748b] text-[0.875rem] font-semibold">
              <li className="flex items-center gap-2">
                <Shield size={16} className="text-[#0066cc]" />
                <a href="#" className="hover:text-[#004890] transition-colors">{t('footer.privacy', 'Privacy Policy')}</a>
              </li>
              <li className="flex items-center gap-2">
                <Accessibility size={16} className="text-[#0066cc]" />
                <a href="#" className="hover:text-[#004890] transition-colors">{t('footer.accessibility', 'Accessibility')}</a>
              </li>
              <li className="flex items-center gap-2">
                <Info size={16} className="text-[#0066cc]" />
                <a href="#" className="hover:text-[#004890] transition-colors">{t('footer.terms', 'Terms of Use')}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - 纯净法律声明 */}
        <div className="pt-8 border-t border-[#e2e8f0] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[#94a3b8] text-[0.8125rem] font-bold tracking-widest">
            © {currentYear} {t('footer.organization')}
          </p>
          <div className="flex gap-8 text-[0.8125rem] font-black text-[#94a3b8]">
            <span className="tracking-widest">{t('footer.allRights')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
