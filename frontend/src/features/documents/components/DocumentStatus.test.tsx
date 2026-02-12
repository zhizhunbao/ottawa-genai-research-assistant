import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DocumentStatus } from './DocumentStatus'

describe('DocumentStatus', () => {
  it('renders correctly for indexed status', () => {
    render(<DocumentStatus name="Report Q1.pdf" status="indexed" />)
    expect(screen.getByText('Report Q1.pdf')).toBeInTheDocument()
    expect(screen.getByText('Indexed')).toBeInTheDocument()
  })

  it('renders correctly for processing status', () => {
    render(<DocumentStatus name="Report Q2.pdf" status="processing" />)
    expect(screen.getByText('Report Q2.pdf')).toBeInTheDocument()
    expect(screen.getByText('Processing')).toBeInTheDocument()
  })

  it('renders correctly for failed status', () => {
    render(<DocumentStatus name="Buggy.pdf" status="failed" />)
    expect(screen.getByText('Buggy.pdf')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('shows the date if provided', () => {
    const updatedAt = '2026-02-10T12:00:00Z'
    render(<DocumentStatus name="Report.pdf" status="indexed" updatedAt={updatedAt} />)
    // The date formatting depends on locale, but it should contain "2026"
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })
})
