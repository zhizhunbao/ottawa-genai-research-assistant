import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ConfidenceIndicator } from './ConfidenceIndicator'
import { TooltipProvider } from '@/shared/components/ui'

describe('ConfidenceIndicator', () => {
  it('renders correctly with high confidence', () => {
    render(<ConfidenceIndicator confidence={0.9} />)
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('confidence.high')).toBeInTheDocument()
  })

  it('renders correctly with medium confidence', () => {
    render(<ConfidenceIndicator confidence={0.6} />)
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('confidence.medium')).toBeInTheDocument()
  })

  it('renders correctly with low confidence', () => {
    render(<ConfidenceIndicator confidence={0.3} />)
    expect(screen.getByText('30%')).toBeInTheDocument()
    expect(screen.getByText('confidence.low')).toBeInTheDocument()
  })

  it('renders in compact mode correctly', () => {
    const { container } = render(
      <TooltipProvider>
        <ConfidenceIndicator confidence={0.9} compact />
      </TooltipProvider>
    )
    // In compact mode, the text shouldn't be visible (it's in a tooltip)
    expect(screen.queryByText('90%')).not.toBeInTheDocument()
    // It should render a badge with the icon
    expect(container.querySelector('div, span, button')).toBeInTheDocument()
  })
})
