import { Report, BusinessData, EmploymentData } from '../types';

export const mockReports: Report[] = [
  {
    id: '1',
    title: 'Q1 2024 Economic Development Summary',
    generatedAt: new Date('2024-01-15'),
    type: 'summary',
    status: 'completed'
  },
  {
    id: '2',
    title: 'Small Business Growth Analysis',
    generatedAt: new Date('2024-01-10'),
    type: 'analysis',
    status: 'completed'
  },
  {
    id: '3',
    title: 'Employment Trends Report',
    generatedAt: new Date('2024-01-08'),
    type: 'trend',
    status: 'completed'
  }
];

export const mockBusinessData: BusinessData[] = [
  { sector: 'Technology', growth: 22, businesses: 145 },
  { sector: 'Healthcare', growth: 18, businesses: 98 },
  { sector: 'Retail', growth: 12, businesses: 234 },
  { sector: 'Manufacturing', growth: 8, businesses: 67 },
  { sector: 'Services', growth: 15, businesses: 189 }
];

export const mockEmploymentData: EmploymentData[] = [
  { name: 'Full-time', value: 65, color: '#667eea' },
  { name: 'Part-time', value: 25, color: '#10b981' },
  { name: 'Contract', value: 10, color: '#f59e0b' }
]; 