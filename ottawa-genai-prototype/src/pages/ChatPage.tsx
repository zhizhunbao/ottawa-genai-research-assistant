import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, BarChart3, Download, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../App';
import { mockInitialMessage } from '../mock/data/messages';
import { mockChartData } from '../mock/data/charts';
import './ChatPage.css';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chart?: any;
  hasChart?: boolean;
}

const ChatPage: React.FC = () => {
  const { t } = useLanguage();
  
  // Use mock data instead of hardcoded data
  const [messages, setMessages] = useState<Message[]>([mockInitialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Use mock chart data
  const economicData = mockChartData.businessGrowth;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (userMessage: string): { content: string; hasChart: boolean; chart?: any } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('business') || lowerMessage.includes('growth') || lowerMessage.includes('trend')) {
      return {
        content: `## Business Growth Analysis

Based on the latest Economic Development reports, here's what I found:

### Key Findings:
- **New business registrations** have increased by **15.2%** over the past 6 months
- **Small business loan approvals** are up by **8.3%** compared to last year
- The **technology sector** shows the strongest growth at **22.1%**

### Recommendations:
1. Continue supporting tech startup initiatives
2. Expand small business loan programs
3. Focus on downtown revitalization projects

The chart below shows the monthly progression of new business registrations and growth rates.`,
        hasChart: true,
        chart: economicData
      };
    }
    
    if (lowerMessage.includes('unemploy') || lowerMessage.includes('job') || lowerMessage.includes('employment')) {
      return {
        content: `## Employment Trends in Ottawa

### Current Employment Statistics:
- **Unemployment rate**: 4.2% (down from 5.1% last year)
- **Job openings**: 12,500 active postings
- **Average salary growth**: 3.8% annually

### Sector Breakdown:
- **Technology**: 35% of new jobs
- **Healthcare**: 18% of new jobs  
- **Professional Services**: 15% of new jobs
- **Manufacturing**: 12% of new jobs

### Key Initiatives:
- Skills training programs launched
- Partnership with local colleges expanded
- Remote work policies updated`,
        hasChart: false
      };
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
      return {
        content: `## How I Can Help You

I'm designed to assist Ottawa's Economic Development team with:

### 📊 **Data Analysis**
- Analyze economic reports and trends
- Generate insights from uploaded PDF documents
- Create visualizations and charts

### 💬 **Q&A Support**
- Answer questions about city economic data
- Provide policy information
- Explain economic indicators

### 📋 **Report Generation**
- Create structured analysis reports
- Generate executive summaries
- Export findings to PDF/Word

### 🔍 **Research Assistance**
- Search through document databases
- Find relevant economic data
- Cross-reference multiple sources

Try asking me about business growth trends, employment statistics, or economic development initiatives!`,
        hasChart: false
      };
    }

    // Default response
    return {
      content: `Thank you for your question about "${userMessage}". 

I understand you're looking for information related to Ottawa's economic development. While I don't have specific data on this topic in my current knowledge base, I can help you with:

- **Business registration trends**
- **Employment statistics** 
- **Economic growth indicators**
- **Small business support programs**
- **Development project updates**

Could you please rephrase your question or ask about one of these specific areas? You can also upload relevant PDF documents for me to analyze.`,
      hasChart: false
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const response = simulateAIResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        hasChart: response.hasChart,
        chart: response.chart
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadChart = () => {
    // In a real app, this would generate and download the chart
    alert('Chart download functionality would be implemented here');
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <h1>AI Research Assistant</h1>
          <p>Ask questions about Ottawa's economic development data</p>
        </div>

        <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user' ? (
                  <User size={20} aria-hidden="true" />
                ) : (
                  <Bot size={20} aria-hidden="true" />
                )}
              </div>
              
              <div className="message-content">
                <div className="message-text">
                  {message.type === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>

                {message.hasChart && message.chart && (
                  <div className="message-chart">
                    <div className="chart-header">
                      <h4>Business Growth Trends</h4>
                      <button 
                        onClick={downloadChart}
                        className="chart-download-btn"
                        aria-label="Download chart"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={message.chart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="businesses" 
                          stroke="#667eea" 
                          strokeWidth={2}
                          name="New Businesses"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="growth" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Growth Rate (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {message.type === 'assistant' && (
                  <div className="message-actions">
                    <button 
                      onClick={() => copyToClipboard(message.content)}
                      className="action-btn"
                      aria-label="Copy message"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                    <button 
                      className="action-btn"
                      aria-label="Helpful response"
                    >
                      <ThumbsUp size={14} />
                    </button>
                    <button 
                      className="action-btn"
                      aria-label="Not helpful response"
                    >
                      <ThumbsDown size={14} />
                    </button>
                  </div>
                )}

                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">
                <Bot size={20} aria-hidden="true" />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="chat-input">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about economic development data..."
              rows={1}
              disabled={isLoading}
              aria-label="Message input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="send-button"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
          
          <div className="input-suggestions">
            <button 
              onClick={() => setInputValue("What are the latest business growth trends?")}
              className="suggestion-btn"
            >
              Business trends
            </button>
            <button 
              onClick={() => setInputValue("Show me employment statistics")}
              className="suggestion-btn"
            >
              Employment data
            </button>
            <button 
              onClick={() => setInputValue("What can you help me with?")}
              className="suggestion-btn"
            >
              Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 