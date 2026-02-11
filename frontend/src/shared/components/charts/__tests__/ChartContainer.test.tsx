/**
 * ChartContainer 组件测试
 *
 * 对应 US-301: Chart Visualization
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChartContainer, type ChartData } from '../ChartContainer';

describe('ChartContainer', () => {
  const lineChartData: ChartData = {
    type: 'line',
    title: 'GDP Growth',
    xKey: 'quarter',
    yKeys: ['value'],
    data: [
      { quarter: 'Q1', value: 2.5 },
      { quarter: 'Q2', value: 3.1 },
    ],
  };

  const barChartData: ChartData = {
    type: 'bar',
    title: 'Sector Comparison',
    xKey: 'sector',
    yKeys: ['value'],
    data: [
      { sector: 'Tech', value: 100 },
      { sector: 'Finance', value: 80 },
    ],
  };

  const pieChartData: ChartData = {
    type: 'pie',
    title: 'Market Share',
    data: [
      { name: 'A', value: 60 },
      { name: 'B', value: 40 },
    ],
  };

  it('renders line chart correctly', () => {
    render(<ChartContainer chart={lineChartData} />);
    expect(screen.getByText('GDP Growth')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders bar chart correctly', () => {
    render(<ChartContainer chart={barChartData} />);
    expect(screen.getByText('Sector Comparison')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders pie chart correctly', () => {
    render(<ChartContainer chart={pieChartData} />);
    expect(screen.getByText('Market Share')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders export buttons when showExport is true', () => {
    render(<ChartContainer chart={lineChartData} showExport={true} />);
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('does not render export buttons when showExport is false', () => {
    render(<ChartContainer chart={lineChartData} showExport={false} />);
    expect(screen.queryByText('PNG')).not.toBeInTheDocument();
    expect(screen.queryByText('PDF')).not.toBeInTheDocument();
  });

  it('renders source references', () => {
    const sources = [
      { document_id: '1', document_name: 'Report A', page_number: 5 },
      { document_id: '2', document_name: 'Report B', page_number: 10 },
    ];
    render(<ChartContainer chart={lineChartData} sources={sources} />);
    expect(screen.getByText(/Report A \(p\.5\)/)).toBeInTheDocument();
    expect(screen.getByText(/Report B \(p\.10\)/)).toBeInTheDocument();
  });
});
