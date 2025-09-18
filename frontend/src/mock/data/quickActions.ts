import { Brain, TrendingUp, Upload } from 'lucide-react';

export interface QuickActionData {
  title: string;
  description: string;
  link: string;
  icon: any;
  primary: boolean;
}

export const getMockQuickActions = (t: (key: string) => string): QuickActionData[] => [
  {
    title: t('features.qa.title'),
    description: t('features.qa.desc'),
    link: '/chat',
    icon: Brain,
    primary: true
  },
  {
    title: t('upload.title'),
    description: t('upload.description'),
    link: '/upload',
    icon: Upload,
    primary: false
  },
  {
    title: t('reports.title'),
    description: t('reports.description'),
    link: '/reports',
    icon: TrendingUp,
    primary: false
  }
]; 