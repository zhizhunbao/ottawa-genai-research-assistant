/**
 * 文档组件测试
 *
 * 遵循 dev-tdd_workflow skill 规范。
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProcessingStatus } from '../components/ProcessingStatus'
import { UploadGuidance } from '../components/UploadGuidance'

describe('ProcessingStatus', () => {
  it('renders processing status cards', () => {
    render(<ProcessingStatus />)
    expect(screen.getByText('upload.status.processing.title')).toBeInTheDocument()
    expect(screen.getByText('upload.status.analysis.title')).toBeInTheDocument()
    expect(screen.getByText('upload.status.knowledge.title')).toBeInTheDocument()
  })
})

describe('UploadGuidance', () => {
  it('renders upload guidelines', () => {
    render(<UploadGuidance />)
    expect(screen.getByText('upload.guidance.formats.title')).toBeInTheDocument()
    expect(screen.getByText('upload.guidance.bestPractices.title')).toBeInTheDocument()
    expect(screen.getByText('upload.guidance.privacy.title')).toBeInTheDocument()
  })
})
