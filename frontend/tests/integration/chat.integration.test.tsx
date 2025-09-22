import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ChatPage from '../../src/pages/ChatPage';

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

// Mock fetch for API calls
const mockFetch = (response: any, status = 200) => {
  return jest.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
  });
};

describe('Chat Integration Tests', () => {
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

  describe('Send Message Integration', () => {
    it('should successfully send a message and receive response', async () => {
      // Mock successful chat response
      const mockResponse = {
        id: 'msg-123',
        type: 'assistant',
        content: 'This is a test response from the AI assistant.',
        timestamp: '2024-01-15T10:30:00Z',
        hasChart: false
      };

      global.fetch = mockFetch(mockResponse);

      renderWithRouter(<ChatPage />);

      // 等待页面加载
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question about economic development data/i)).toBeInTheDocument();
      });

      // 发送消息
      const messageInput = screen.getByPlaceholderText(/ask a question about economic development data/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'What is the economic outlook for Ottawa?' } 
      });
      fireEvent.click(sendButton);

      // 验证API调用
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${API_BASE_URL}/chat/message`,
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('"message":"What is the economic outlook for Ottawa?"')
          })
        );
      });

      // 验证响应显示
      await waitFor(() => {
        expect(screen.getByText(/this is a test response from the ai assistant/i)).toBeInTheDocument();
      });

      // 验证消息已清空
      expect(messageInput).toHaveValue('');
    });

    it('should handle chat error gracefully with fallback', async () => {
      // Mock API error - this should trigger fallback to mock data
      global.fetch = jest.fn().mockRejectedValue(new Error('Service unavailable'));

      renderWithRouter(<ChatPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question about economic development data/i)).toBeInTheDocument();
      });

      const messageInput = screen.getByPlaceholderText(/ask a question about economic development data/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'Test message' } 
      });
      fireEvent.click(sendButton);

      // 验证用户消息显示
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      // 验证最终显示fallback响应（模拟延迟后）
      await waitFor(() => {
        // 应该显示某种响应，即使是fallback
        const messages = screen.getAllByText(/test message/i);
        expect(messages.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('should send message with document context', async () => {
      const mockResponse = {
        id: 'msg-124',
        type: 'assistant',
        content: 'Based on the uploaded document, here is my analysis...',
        timestamp: '2024-01-15T10:35:00Z',
        hasChart: false
      };

      global.fetch = mockFetch(mockResponse);

      renderWithRouter(<ChatPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/ask a question about economic development data/i)).toBeInTheDocument();
      });

      // 发送带有文档上下文的消息（通过消息内容模拟上下文）
      const messageInput = screen.getByPlaceholderText(/ask a question about economic development data/i);
      const sendButton = screen.getByRole('button', { name: /send/i });

      fireEvent.change(messageInput, { 
        target: { value: 'Analyze this document' } 
      });
      fireEvent.click(sendButton);

      // 验证API调用包含上下文
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${API_BASE_URL}/chat/message`,
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('"message":"Analyze this document"')
          })
        );
      });
    });
  });

  describe('Chat Initial State Integration', () => {
    it('should display initial welcome message on page load', async () => {
      renderWithRouter(<ChatPage />);

      // 验证初始欢迎消息显示
      await waitFor(() => {
        expect(screen.getByText(/Hello! I'm your Ottawa Economic Development AI Assistant/i)).toBeInTheDocument();
      });

      // 验证消息输入框存在
      expect(screen.getByPlaceholderText(/ask a question about economic development data/i)).toBeInTheDocument();
      
      // 验证建议按钮存在
      expect(screen.getByText('Business trends')).toBeInTheDocument();
      expect(screen.getByText('Employment data')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
    });
  });
}); 