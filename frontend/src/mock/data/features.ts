import { BarChart3, FileText, MessageSquare, Shield } from 'lucide-react';

export interface FeatureData {
  icon: any;
  title: string;
  description: string;
  color: string;
}

export const getMockFeatures = (t: (key: string) => string): FeatureData[] => [
  {
    icon: MessageSquare,
    title: t('features.qa.title'),
    description: t('features.qa.desc'),
    color: '#667eea'
  },
  {
    icon: BarChart3,
    title: t('features.analysis.title'),
    description: t('features.analysis.desc'),
    color: '#10b981'
  },
  {
    icon: FileText,
    title: t('features.reports.title'),
    description: t('features.reports.desc'),
    color: '#f59e0b'
  },
  {
    icon: Shield,
    title: t('features.accessibility.title'),
    description: t('features.accessibility.desc'),
    color: '#8b5cf6'
  }
]; 