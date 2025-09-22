import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { api } from '../../src/config/api';
import DocumentUploadPage from '../../src/pages/DocumentUploadPage';

// Test utility function
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock the API
jest.mock('../../src/config/api', () => ({
  api: {
    getUploadedFiles: jest.fn(),
    uploadFile: jest.fn(),
    deleteFile: jest.fn()
  }
}));

const mockApi = api as jest.Mocked<typeof api>;

// Mock file creation helper
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('Document Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getUploadedFiles.mockResolvedValue([]);
  });

  describe('Page Structure', () => {
    it('should render document upload page correctly', async () => {
      renderWithRouter(<DocumentUploadPage />);

      // 验证页面基本结构
      expect(screen.getByText('Document Upload')).toBeInTheDocument();
      expect(screen.getByText('Drop PDF files here or click to browse')).toBeInTheDocument();
      expect(screen.getByText('Supported format: PDF documents only')).toBeInTheDocument();
      expect(screen.getByText('No documents uploaded yet')).toBeInTheDocument();
    });

    it('should show processing status cards', async () => {
      renderWithRouter(<DocumentUploadPage />);

      await waitFor(() => {
        expect(screen.getByText('📄 Document Processing')).toBeInTheDocument();
        expect(screen.getByText('🔍 Content Analysis')).toBeInTheDocument();
        expect(screen.getByText('💾 Knowledge Base')).toBeInTheDocument();
        expect(screen.getByText('Ready')).toBeInTheDocument(); // Knowledge Base status
      });
    });

    it('should show upload guidelines', async () => {
      renderWithRouter(<DocumentUploadPage />);

      expect(screen.getByText('Upload Guidelines')).toBeInTheDocument();
      expect(screen.getByText('✅ Supported Formats')).toBeInTheDocument();
      expect(screen.getByText('📋 Best Practices')).toBeInTheDocument();
      expect(screen.getByText('🔒 Privacy & Security')).toBeInTheDocument();
    });
  });

  describe('File Management', () => {
    it('should display uploaded files correctly', async () => {
      const mockFiles = [
        {
          id: '1',
          name: 'economic-report.pdf',
          size: 2048000, // 2MB
          type: 'application/pdf',
          status: 'completed' as const,
          progress: 100,
          uploadedAt: new Date('2024-01-15')
        }
      ];

      mockApi.getUploadedFiles.mockResolvedValue(mockFiles);

      renderWithRouter(<DocumentUploadPage />);

      await waitFor(() => {
        expect(screen.getByText('economic-report.pdf')).toBeInTheDocument();
        expect(screen.getByText('1.95 MB')).toBeInTheDocument(); // Component formats to 1.95 MB
        expect(screen.getByText('Uploaded Documents (1)')).toBeInTheDocument();
      });
    });

    it('should handle file deletion', async () => {
      const mockFiles = [
        {
          id: '1',
          name: 'to-delete.pdf',
          size: 1024,
          type: 'application/pdf',
          status: 'completed' as const,
          progress: 100,
          uploadedAt: new Date('2024-01-15')
        }
      ];

      mockApi.getUploadedFiles.mockResolvedValue(mockFiles);
      mockApi.deleteFile.mockResolvedValue({} as any);

      renderWithRouter(<DocumentUploadPage />);

      await waitFor(() => {
        expect(screen.getByText('to-delete.pdf')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByLabelText('Remove to-delete.pdf');
      fireEvent.click(deleteButton);

      // Verify API was called
      expect(mockApi.deleteFile).toHaveBeenCalledWith('1');
    });

    it('should show different file statuses', async () => {
      const mockFiles = [
        {
          id: '1',
          name: 'uploading.pdf',
          size: 1024,
          type: 'application/pdf',
          status: 'uploading' as const,
          progress: 50,
          uploadedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'completed.pdf',
          size: 1024,
          type: 'application/pdf',
          status: 'completed' as const,
          progress: 100,
          uploadedAt: new Date('2024-01-15')
        },
        {
          id: '3',
          name: 'error.pdf',
          size: 1024,
          type: 'application/pdf',
          status: 'error' as const,
          progress: 0,
          uploadedAt: new Date('2024-01-15')
        }
      ];

      mockApi.getUploadedFiles.mockResolvedValue(mockFiles);

      renderWithRouter(<DocumentUploadPage />);

      await waitFor(() => {
        // 验证文件名显示
        expect(screen.getByText('completed.pdf')).toBeInTheDocument();
        expect(screen.getByText('error.pdf')).toBeInTheDocument();
        
        // 验证上传进度显示
        expect(screen.getByText('50%')).toBeInTheDocument(); // 上传进度
        expect(screen.getByText('Uploading Files')).toBeInTheDocument(); // 上传区域标题
        
        // 验证状态指示器（使用getAllByText因为"Completed"出现在多个地方）
        expect(screen.getAllByText('Completed')).toHaveLength(2); // 文件状态 + 处理状态卡片
        
        // Error状态通过图标显示，不是文本，所以我们验证error.pdf文件存在即可
        // Error status is shown via icon, not text, so we verify error.pdf file exists
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockApi.getUploadedFiles.mockRejectedValue(new Error('API Error'));

      renderWithRouter(<DocumentUploadPage />);

      // 页面应该仍然渲染，但显示空状态
      await waitFor(() => {
        expect(screen.getByText('Document Upload')).toBeInTheDocument();
        expect(screen.getByText('No documents uploaded yet')).toBeInTheDocument();
      });
    });

    it('should show empty state when no files', async () => {
      mockApi.getUploadedFiles.mockResolvedValue([]);

      renderWithRouter(<DocumentUploadPage />);

      await waitFor(() => {
        expect(screen.getByText('No documents uploaded yet')).toBeInTheDocument();
        expect(screen.getByText('Upload PDF reports to get started with AI analysis')).toBeInTheDocument();
        expect(screen.getByText('Uploaded Documents (0)')).toBeInTheDocument();
      });
    });
  });

  describe('UI Components', () => {
    it('should have accessible upload zone', async () => {
      renderWithRouter(<DocumentUploadPage />);

      const uploadZone = screen.getByRole('button', { name: 'Upload documents' });
      expect(uploadZone).toBeInTheDocument();
      expect(uploadZone).toHaveAttribute('tabIndex', '0');
    });

    it('should show choose files button', async () => {
      renderWithRouter(<DocumentUploadPage />);

      const chooseButton = screen.getByRole('button', { name: 'Choose Files' });
      expect(chooseButton).toBeInTheDocument();
    });

    it('should display file format restrictions', async () => {
      renderWithRouter(<DocumentUploadPage />);

      // 验证格式限制信息
      expect(screen.getByText('PDF documents only')).toBeInTheDocument();
      expect(screen.getByText('Text-based PDFs (not scanned images)')).toBeInTheDocument();
      expect(screen.getByText('Maximum file size: 50MB')).toBeInTheDocument();
    });

    it('should show processing status information', async () => {
      renderWithRouter(<DocumentUploadPage />);

      // 验证处理状态卡片
      expect(screen.getByText('PDF text extraction and indexing')).toBeInTheDocument();
      expect(screen.getByText('AI semantic understanding and categorization')).toBeInTheDocument();
      expect(screen.getByText('Integration with search and Q&A system')).toBeInTheDocument();
    });
  });
}); 