import React from 'react';

// Mock Recharts components for testing
export const ResponsiveContainer = ({ children, width, height }) => {
  return React.createElement('div', {
    'data-testid': 'responsive-container',
    className: 'recharts-responsive-container',
    style: { width, height }
  }, children);
};

export const LineChart = ({ data, children }) => {
  return React.createElement('div', {
    'data-testid': 'line-chart',
    className: 'recharts-line-chart'
  }, children);
};

export const Line = ({ type, dataKey, stroke, strokeWidth, name }) => {
  return React.createElement('div', {
    'data-testid': 'line',
    className: 'recharts-line',
    'data-key': dataKey,
    'data-stroke': stroke,
    'data-name': name
  });
};

export const XAxis = ({ dataKey }) => {
  return React.createElement('div', {
    'data-testid': 'x-axis',
    className: 'recharts-x-axis',
    'data-key': dataKey
  });
};

export const YAxis = () => {
  return React.createElement('div', {
    'data-testid': 'y-axis',
    className: 'recharts-y-axis'
  });
};

export const CartesianGrid = ({ strokeDasharray }) => {
  return React.createElement('div', {
    'data-testid': 'cartesian-grid',
    className: 'recharts-cartesian-grid',
    'data-stroke-dasharray': strokeDasharray
  });
};

export const Tooltip = () => {
  return React.createElement('div', {
    'data-testid': 'tooltip',
    className: 'recharts-tooltip'
  });
};

export const BarChart = ({ data, children }) => {
  return React.createElement('div', {
    'data-testid': 'bar-chart',
    className: 'recharts-bar-chart'
  }, children);
};

export const Bar = ({ dataKey, fill, name }) => {
  return React.createElement('div', {
    'data-testid': 'bar',
    className: 'recharts-bar',
    'data-key': dataKey,
    'data-fill': fill,
    'data-name': name
  });
};

export const PieChart = ({ children }) => {
  return React.createElement('div', {
    'data-testid': 'pie-chart',
    className: 'recharts-pie-chart'
  }, children);
};

export const Pie = ({ data, cx, cy, outerRadius, fill, dataKey, label, children }) => {
  return React.createElement('div', {
    'data-testid': 'pie',
    className: 'recharts-pie',
    'data-key': dataKey,
    'data-fill': fill
  }, children);
};

export const Cell = ({ fill }) => {
  return React.createElement('div', {
    'data-testid': 'cell',
    className: 'recharts-cell',
    'data-fill': fill
  });
}; 