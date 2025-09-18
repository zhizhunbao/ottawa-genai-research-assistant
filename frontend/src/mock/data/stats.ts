import { StatData } from '../types';

export const getMockStats = (t: (key: string) => string): StatData[] => [
  { number: '10+', label: t('stats.documents') },
  { number: '500+', label: t('stats.queries') },
  { number: '2', label: t('stats.languages') },
  { number: '100%', label: t('stats.accessibility') }
]; 