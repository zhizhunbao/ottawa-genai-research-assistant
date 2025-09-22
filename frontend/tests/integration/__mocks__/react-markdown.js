import React from 'react';

// Mock ReactMarkdown component for testing
const ReactMarkdown = ({ children }) => {
  return React.createElement('div', { 
    'data-testid': 'react-markdown',
    className: 'markdown-content' 
  }, children);
};

export default ReactMarkdown; 