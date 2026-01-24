// Recent activity data for dashboard
export interface Activity {
  id: string;
  type: 'report' | 'query' | 'registration' | 'upload';
  title: string;
  description: string;
  time: string;
  icon: 'FileText' | 'MessageSquare' | 'Users' | 'Upload';
}

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'report',
    title: 'New report generated',
    description: 'Q2 Business Growth Analysis',
    time: '2 hours ago',
    icon: 'FileText'
  },
  {
    id: '2',
    type: 'query',
    title: 'AI Query',
    description: '"What are the employment trends in the tech sector?"',
    time: '4 hours ago',
    icon: 'MessageSquare'
  },
  {
    id: '3',
    type: 'registration',
    title: 'New businesses registered',
    description: '23 new registrations this week',
    time: '1 day ago',
    icon: 'Users'
  }
]; 