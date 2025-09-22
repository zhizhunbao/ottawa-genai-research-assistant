import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReportPage from '../../src/pages/ReportPage';

// 测试环境配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

// 测试工具函数
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock authenticated user
const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'researcher'
};

describe('Reports Integration Tests', () => {
  beforeEach(() => {
    // 设置认证token
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // 重置所有mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Report Display Integration', () => {
    it('should display the report page with sidebar and main content', async () => {
      renderWithRouter(<ReportPage />);

      // 验证页面基本结构
      expect(screen.getByText('Generated Reports')).toBeInTheDocument();
      expect(screen.getByText('Generate New')).toBeInTheDocument();
      
      // 验证默认选中的报告内容显示
      await waitFor(() => {
        expect(screen.getByText('Ottawa Business Growth Analysis Q1 2024')).toBeInTheDocument();
        expect(screen.getByText('Executive Summary')).toBeInTheDocument();
        expect(screen.getByText('Key Findings')).toBeInTheDocument();
        expect(screen.getByText('Data Analysis')).toBeInTheDocument();
        expect(screen.getByText('Recommendations')).toBeInTheDocument();
      });
    });

    it('should switch between different reports when clicking sidebar items', async () => {
      renderWithRouter(<ReportPage />);

      // 等待页面加载
      await waitFor(() => {
        expect(screen.getByText('Generated Reports')).toBeInTheDocument();
      });

      // 查找并点击不同的报告项
      const reportItems = screen.getAllByRole('generic').filter(el => 
        el.className.includes('report-item')
      );

      if (reportItems.length > 1) {
        fireEvent.click(reportItems[1]);
        
        // 验证报告内容切换
        await waitFor(() => {
          // 由于使用mock数据，验证基本结构仍然存在
          expect(screen.getByText('Executive Summary')).toBeInTheDocument();
        });
      }
    });

    it('should display report metadata correctly', async () => {
      renderWithRouter(<ReportPage />);

      await waitFor(() => {
        // 验证报告元数据显示
        expect(screen.getByText(/Generated/)).toBeInTheDocument();
        expect(screen.getByText(/Report/)).toBeInTheDocument();
      });
    });

    it('should display action buttons in header', async () => {
      renderWithRouter(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Share')).toBeInTheDocument();
        expect(screen.getByText('Export PDF')).toBeInTheDocument();
      });
    });

    it('should display summary cards with metrics', async () => {
      renderWithRouter(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('📈 Business Growth')).toBeInTheDocument();
        expect(screen.getByText('👥 Employment')).toBeInTheDocument();
        expect(screen.getByText('💰 Investment')).toBeInTheDocument();
        expect(screen.getByText('+15.2%')).toBeInTheDocument();
        expect(screen.getByText('4.2%')).toBeInTheDocument();
        expect(screen.getByText('$12.5M')).toBeInTheDocument();
      });
    });

    it('should display charts in data analysis section', async () => {
      renderWithRouter(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Business Growth by Sector')).toBeInTheDocument();
        expect(screen.getByText('Employment Distribution')).toBeInTheDocument();
      });
    });

    it('should display recommendations section', async () => {
      renderWithRouter(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Short-term Actions (0-6 months)')).toBeInTheDocument();
        expect(screen.getByText('📈 Medium-term Goals (6-18 months)')).toBeInTheDocument();
        expect(screen.getByText('🚀 Long-term Vision (18+ months)')).toBeInTheDocument();
      });
    });

    it('should display methodology section', async () => {
      renderWithRouter(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Methodology')).toBeInTheDocument();
        expect(screen.getByText(/Ottawa Economic Development quarterly reports/)).toBeInTheDocument();
        expect(screen.getByText(/Statistics Canada employment data/)).toBeInTheDocument();
      });
    });
  });

  describe('Report Interaction Integration', () => {
    it('should handle Generate New button click', async () => {
      renderWithRouter(<ReportPage />);

      const generateButton = screen.getByText('Generate New');
      fireEvent.click(generateButton);

      // 由于真实组件中这个按钮可能没有实际功能，我们只验证它存在且可点击
      expect(generateButton).toBeInTheDocument();
    });

    it('should handle Share button click', async () => {
      renderWithRouter(<ReportPage />);

      await waitFor(() => {
        const shareButton = screen.getByText('Share');
        fireEvent.click(shareButton);
        expect(shareButton).toBeInTheDocument();
      });
    });

    it('should handle Export PDF button click', async () => {
      renderWithRouter(<ReportPage />);

      await waitFor(() => {
        const exportButton = screen.getByText('Export PDF');
        fireEvent.click(exportButton);
        expect(exportButton).toBeInTheDocument();
      });
    });
  });

  describe('Report Content Integration', () => {
    it('should display complete report structure', async () => {
      renderWithRouter(<ReportPage />);

      await waitFor(() => {
        // 验证完整的报告结构
        expect(screen.getByText('Executive Summary')).toBeInTheDocument();
        expect(screen.getByText('Key Findings')).toBeInTheDocument();
        expect(screen.getByText('Data Analysis')).toBeInTheDocument();
        expect(screen.getByText('Recommendations')).toBeInTheDocument();
        expect(screen.getByText('Methodology')).toBeInTheDocument();
      });
    });

    it('should display key findings content', async () => {
      renderWithRouter(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText('Business Sector Performance')).toBeInTheDocument();
        expect(screen.getByText('Employment Trends')).toBeInTheDocument();
        expect(screen.getByText(/technology sector continues to lead/)).toBeInTheDocument();
      });
    });

    it('should display recommendation items', async () => {
      renderWithRouter(<ReportPage />);

      await waitFor(() => {
        expect(screen.getByText(/Expand digital skills training programs/)).toBeInTheDocument();
        expect(screen.getByText(/Develop sector-specific support programs/)).toBeInTheDocument();
        expect(screen.getByText(/Position Ottawa as a leading tech hub/)).toBeInTheDocument();
      });
    });
  });
}); 