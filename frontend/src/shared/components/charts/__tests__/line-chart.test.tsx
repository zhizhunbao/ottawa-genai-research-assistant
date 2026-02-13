/**
 * LineChart unit tests
 *
 * @module shared/components/charts
 * @template none
 * @reference none
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LineChart } from '../line-chart';

// Note: Recharts ResponsiveContainer doesn't render SVG in JSDOM
// We test the container and text elements instead

describe('LineChart', () => {
  const mockData = [
    { month: 'Jan', value: 100 },
    { month: 'Feb', value: 120 },
    { month: 'Mar', value: 90 },
    { month: 'Apr', value: 150 },
  ];

  it('renders without crashing', () => {
    const { container } = render(
      <LineChart data={mockData} xKey="month" yKeys={['value']} />
    );
    // Container should have content
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <LineChart
        data={mockData}
        xKey="month"
        yKeys={['value']}
        title="Monthly Growth"
      />
    );
    expect(screen.getByText('Monthly Growth')).toBeInTheDocument();
  });

  it('renders source when provided', () => {
    render(
      <LineChart
        data={mockData}
        xKey="month"
        yKeys={['value']}
        source="Economic Report 2025"
      />
    );
    expect(screen.getByText(/Source: Economic Report 2025/)).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    render(<LineChart data={mockData} xKey="month" yKeys={['value']} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('handles multiple y keys', () => {
    const multiData = [
      { month: 'Jan', value1: 100, value2: 80 },
      { month: 'Feb', value1: 120, value2: 90 },
    ];
    const { container } = render(
      <LineChart data={multiData} xKey="month" yKeys={['value1', 'value2']} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles empty data', () => {
    const { container } = render(
      <LineChart data={[]} xKey="month" yKeys={['value']} />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
