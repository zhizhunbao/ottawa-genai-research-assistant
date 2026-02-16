/**
 * Footer - Multi-column footer with logo, link groups, and copyright
 *
 * @module shared/components/layout
 * @source shadcn-landing-page/src/components/Footer.tsx
 * @reference https://github.com/leoMirandaa/shadcn-landing-page
 */
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Globe, ExternalLink, Shield, Accessibility, FileText } from 'lucide-react'

interface FooterLinkGroup {
  title: string
  links: { label: string; href: string; external?: boolean; icon?: React.ReactNode }[]
}

export function Footer() {
  const { t } = useTranslation('common')
  const currentYear = new Date().getFullYear()

  const footerGroups: FooterLinkGroup[] = [
    {
      title: t('footer.resources', 'Resources'),
      links: [
        { label: 'Ottawa.ca', href: 'https://ottawa.ca', external: true },
        { label: t('footer.openData', 'Open Data Portal'), href: 'https://open.ottawa.ca', external: true },
        { label: t('footer.economicDev', 'Economic Development'), href: 'https://ottawa.ca/economic-development', external: true },
      ],
    },
    {
      title: t('footer.product', 'Product'),
      links: [
        { label: t('nav.features', 'Features'), href: '#features' },
        { label: t('nav.howItWorks', 'How It Works'), href: '#how-it-works' },
        { label: t('nav.chat', 'Chat'), href: '/chat' },
      ],
    },
    {
      title: t('footer.compliance', 'Compliance'),
      links: [
        { label: t('footer.privacy', 'Privacy Policy'), href: '#', icon: <Shield size={14} /> },
        { label: t('footer.accessibility', 'Accessibility'), href: '#', icon: <Accessibility size={14} /> },
        { label: t('footer.terms', 'Terms of Use'), href: '#', icon: <FileText size={14} /> },
      ],
    },
  ]

  return (
    <footer id="footer" className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
          {/* Brand & Mission */}
          <div className="col-span-2 xl:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-base shadow-sm">
                🍁
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">
                {t('app.name')}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
              {t('footer.mission', 'An AI-powered research assistant helping the Economic Development team quickly gain insights and generate reports.')}
            </p>
            <div className="flex gap-3">
              <a
                href="mailto:info@ottawa.ca"
                className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
              <a
                href="https://ottawa.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                aria-label="Website"
              >
                <Globe size={16} />
              </a>
            </div>
          </div>

          {/* Link Groups */}
          {footerGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm text-foreground mb-2">{group.title}</h3>
              {group.links.map((link) => (
                <div key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 group"
                    >
                      {link.icon}
                      {link.label}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : link.href.startsWith('#') ? (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                    >
                      {link.icon}
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {currentYear} {t('footer.organization', 'City of Ottawa')}</p>
          <p className="text-xs">{t('footer.allRights', 'All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  )
}
