import { Message, EconomicData } from '../types';

export const mockInitialMessage: Message = {
  id: '1',
  type: 'assistant',
  content: 'Hello! I\'m your Ottawa Economic Development AI Assistant. I can help you analyze economic data, answer questions about city reports, and generate insights. What would you like to know?',
  timestamp: new Date()
};

export const mockEconomicData: EconomicData[] = [
  { month: 'Jan', businesses: 120, growth: 5.2 },
  { month: 'Feb', businesses: 125, growth: 6.1 },
  { month: 'Mar', businesses: 135, growth: 7.8 },
  { month: 'Apr', businesses: 142, growth: 8.3 },
  { month: 'May', businesses: 156, growth: 9.1 },
  { month: 'Jun', businesses: 168, growth: 10.2 }
];

// Mock AI response patterns
export const mockResponsePatterns = {
  business: {
    content: `## Business Growth Analysis

Based on the latest Economic Development reports, here's what I found:

### Key Findings:
- **New business registrations** have increased by **15.2%** over the past 6 months
- **Small business loan approvals** are up by **8.3%** compared to last year
- **The technology sector** shows the strongest growth at **22.1%**

### Recommendations:
1. Continue supporting tech startup initiatives
2. Expand small business loan programs
3. Focus on downtown revitalization projects

The chart below shows the monthly progression of new business registrations and growth rates.`,
    hasChart: true,
    chart: mockEconomicData
  },
  employment: {
    content: `## Employment Trends in Ottawa

### Current Employment Statistics:
- **Unemployment rate**: 4.2% (down from 5.1% last year)
- **Job openings**: 12,500 active postings
- **Average salary growth**: 3.8% annually

### Sector Breakdown:
- **Technology**: 35% of new jobs
- **Healthcare**: 18% of new jobs  
- **Professional Services**: 15% of new jobs
- **Manufacturing**: 12% of new jobs

### Key Initiatives:
- Skills training programs launched
- Partnership with local colleges expanded
- Remote work policies updated`,
    hasChart: false
  },
  default: {
    content: `I can help you with questions about:

📊 **Economic Data Analysis**
- Business growth trends
- Employment statistics
- Sector performance

📋 **Report Generation**
- Quarterly summaries
- Custom analysis reports
- Data visualizations

📁 **Document Processing**
- PDF report analysis
- Data extraction
- Content summarization

Try asking me about business growth, employment trends, or upload a document for analysis!`,
    hasChart: false
  }
}; 