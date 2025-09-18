import { mockChartData } from './charts';

export interface AIResponse {
  content: string;
  hasChart: boolean;
  chart?: any;
}

// AI响应模拟函数
export const simulateAIResponse = (userMessage: string): AIResponse => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('business') || lowerMessage.includes('growth') || lowerMessage.includes('trend')) {
    return {
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
      chart: mockChartData.businessGrowth
    };
  }
  
  if (lowerMessage.includes('unemploy') || lowerMessage.includes('employ') || lowerMessage.includes('job')) {
    return {
      content: `## Employment Statistics Update

Here's the current employment landscape in Ottawa:

### Current Status:
- **Unemployment rate**: 4.2% (down from 5.1% last quarter)
- **New job postings**: Up 12% this month
- **Labor force participation**: 68.5%
- **Youth employment** (15-24): Improved to 89.3%

### Sector Breakdown:
- **Technology**: +2,340 jobs (highest growth)
- **Healthcare**: +1,120 jobs  
- **Professional Services**: +890 jobs
- **Manufacturing**: +340 jobs

### Initiatives:
The city has launched several job training programs focusing on:
1. Digital skills development
2. Green energy sector training
3. Healthcare worker certification programs

These efforts are showing positive results in reducing long-term unemployment and matching skills with employer needs.`,
      hasChart: false
    };
  }

  if (lowerMessage.includes('revenue') || lowerMessage.includes('income') || lowerMessage.includes('financial')) {
    return {
      content: `## Financial Performance Overview

Ottawa's financial indicators show strong performance:

### Revenue Trends:
- **Total municipal revenue** reached $3.1B in Q1 2024
- **Year-over-year growth** of 7.5%
- **Property tax collection** efficiency at 98.2%

### Investment Areas:
- Infrastructure: 35% of budget
- Social Services: 28% of budget  
- Public Safety: 22% of budget
- Economic Development: 15% of budget

The quarterly revenue trends chart shows consistent growth across all major categories.`,
      hasChart: true,
      chart: mockChartData.revenueTrends
    };
  }

  if (lowerMessage.includes('sector') || lowerMessage.includes('industry') || lowerMessage.includes('analysis')) {
    return {
      content: `## Sector Analysis Report

Current sector performance across Ottawa's economy:

### Leading Sectors:
- **Technology**: 22% growth (145 businesses)
- **Healthcare**: 18% growth (98 businesses)
- **Services**: 15% growth (189 businesses)
- **Retail**: 12% growth (234 businesses)
- **Manufacturing**: 8% growth (67 businesses)

### Market Opportunities:
1. **Green Technology**: Emerging sector with high potential
2. **Digital Health**: Growing intersection of tech and healthcare
3. **E-commerce**: Retail sector digitization accelerating

The sector analysis chart provides detailed breakdown of growth and business distribution.`,
      hasChart: true,
      chart: mockChartData.sectorAnalysis
    };
  }

  // Default response
  return {
    content: `Thank you for your question about "${userMessage}". 

I understand you're looking for information related to Ottawa's economic development. While I don't have specific data on this topic in my current knowledge base, I can help you with:

- **Business registration trends**
- **Employment statistics** 
- **Economic growth indicators**
- **Small business support programs**
- **Development project updates**
- **Financial performance analysis**
- **Sector-specific analysis**

Could you please rephrase your question or ask about one of these specific areas? You can also upload relevant PDF documents for me to analyze.`,
    hasChart: false
  };
}; 