/**
 * PieChart 组件测试
 *
 * 对应 US-301: Chart Visualization
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PieChart } from '../PieChart';

// Note: Recharts ResponsiveContainer doesn't render SVG in JSDOM
// We test the container and text elements instead

describe('PieChart', () => {
  const mockData = [
    { name: 'Technology', value: 35 },
    { name: 'Healthcare', value: 25 },
    { name: 'Finance', value: 20 },
    { name: 'Other', value: 20 },
  ];

  it('renders without crashing', () => {
    const { container } = render(<PieChart data={mockData} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<PieChart data={mockData} title="Market Share" />);
    expect(screen.getByText('Market Share')).toBeInTheDocument();
  });

  it('renders source when provided', () => {
    render(<PieChart data={mockData} source="Market Analysis 2025" />);
    expect(screen.getByText(/Source: Market Analysis 2025/)).toBeInTheDocument();
  });

  it('handles empty data', () => {
    const { container } = render(<PieChart data={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with showLabel false', () => {
    const { container } = render(
      <PieChart data={mockData} showLabel={false} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
