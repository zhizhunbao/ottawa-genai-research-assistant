import { UploadedFile } from '../types';

export const mockUploadedFiles: UploadedFile[] = [
  {
    id: '1',
    name: 'Economic Development Q1 Report.pdf',
    size: 2540000,
    type: 'application/pdf',
    status: 'completed',
    progress: 100,
    uploadedAt: new Date('2024-01-15')
  },
  {
    id: '2', 
    name: 'Small Business Survey Results.pdf',
    size: 1870000,
    type: 'application/pdf',
    status: 'completed',
    progress: 100,
    uploadedAt: new Date('2024-01-10')
  }
]; 