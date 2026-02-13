/**
 * BarChart unit tests
 *
 * @module shared/components/charts
 * @template none
 * @reference none
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BarChart } from '../bar-chart';

// Note: Recharts ResponsiveContainer doesn't render SVG in JSDOM
// We test the container and text elements instead

describe('BarChart', () => {
  const mockData = [
    { category: 'Tech', value: 100 },
    { category: 'Healthcare', value: 80 },
    { category: 'Finance', value: 60 },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <BarChart data={mockData} xKey="category" yKeys={['value']} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <BarChart
        data={mockData}
        xKey="category"
        yKeys={['value']}
        title="Sector Comparison"
      />
    );
    expect(screen.getByText('Sector Comparison')).toBeInTheDocument();
  });

  it('renders source when provided', () => {
    render(
      <BarChart
        data={mockData}
        xKey="category"
        yKeys={['value']}
        source="Industry Report"
      />
    );
    expect(screen.getByText(/Source: Industry Report/)).toBeInTheDocument();
  });

  it('handles stacked prop', () => {
    const stackedData = [
      { category: 'A', value1: 50, value2: 30 },
      { category: 'B', value1: 40, value2: 20 },
    ];
    const { container } = render(
      <BarChart
        data={stackedData}
        xKey="category"
        yKeys={['value1', 'value2']}
        stacked={true}
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles empty data', () => {
    const { container } = render(
      <BarChart data={[]} xKey="category" yKeys={['value']} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
