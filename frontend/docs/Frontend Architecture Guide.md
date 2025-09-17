# 🎨 Ottawa GenAI Research Assistant - Frontend Architecture Guide

## 📊 Frontend Architecture Overview

This frontend application adopts a modern React architecture combined with TypeScript for type safety, supporting English-French bilingual functionality, and adhering to WCAG 2.1 accessibility standards. The architectural design emphasizes component reusability, state management, and user experience optimization.

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Interface Layer (React Components)      │
│                    - Page Components (Pages)                    │
│                    - Reusable Components (Components)           │
│                    - Style System (CSS Modules)                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Props & Events
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    State Management Layer (Context API)         │
│                    - Language Context (LanguageContext)         │
│                    - Theme Context (ThemeContext)               │
│                    - User State Management                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ State Updates
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer                               │
│                    - API Service (api.ts)                      │
│                    - Hybrid API (hybridApi.ts)                 │
│                    - Data Transformation Processing            │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP Requests
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Interface Layer (FastAPI)           │
│                    - RESTful API Endpoints                     │
│                    - Mock Data Interface                       │
│                    - Real-time Communication Support           │
└─────────────────────────────────────────────────────────────────┘
```

## 🗂️ Frontend Directory Structure Details

```
frontend/
├── public/               # Static assets directory
│   ├── index.html       # HTML template
│   ├── favicon.ico      # Website icon
│   └── manifest.json    # PWA configuration
├── src/                 # Source code directory
│   ├── components/      # Reusable components
│   │   ├── Navbar.tsx          # Navigation bar component
│   │   └── Navbar.css          # Navigation bar styles
│   ├── pages/          # Page components
│   │   ├── HomePage.tsx        # Home page
│   │   ├── ChatPage.tsx        # Chat page
│   │   ├── DocumentUploadPage.tsx  # Document upload page
│   │   ├── ReportPage.tsx      # Report page
│   │   ├── SettingsPage.tsx    # Settings page
│   │   ├── MockDataManagePage.tsx  # Mock data management page
│   │   └── *.css              # Corresponding style files
│   ├── services/       # Service layer
│   │   ├── api.ts             # Standard API service
│   │   └── hybridApi.ts       # Hybrid API service
│   ├── config/         # Configuration files
│   ├── mock/           # Mock data
│   ├── App.tsx         # Root application component
│   ├── App.css         # Global styles
│   ├── index.tsx       # Application entry point
│   └── index.css       # Base styles
├── docs/               # Project documentation
├── package.json        # Project configuration
├── tsconfig.json       # TypeScript configuration
├── Dockerfile         # Docker configuration
└── README.md          # Project documentation
```

## ⚛️ React Component Architecture

### 1. Page Components (Pages)
Page components are responsible for entire page layouts and main functionality implementation:

#### HomePage - Home Page
```typescript
// Home page showcasing system introduction and quick entry points
const HomePage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="home-container">
      <WelcomeSection />
      <FeatureCards />
      <QuickActions />
    </div>
  );
};
```

#### ChatPage - Chat Page
```typescript
// Core chat interaction functionality
const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendMessage = async (content: string) => {
    // Message sending logic
    const response = await hybridApi.sendMessage(content);
    setMessages(prev => [...prev, response]);
  };
  
  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <MessageInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
};
```

#### DocumentUploadPage - Document Upload Page
```typescript
// Document upload and management functionality
const DocumentUploadPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const handleFileUpload = async (files: FileList) => {
    // File upload logic
    for (const file of files) {
      await api.uploadDocument(file, {
        onProgress: setUploadProgress
      });
    }
    refreshDocuments();
  };
  
  return (
    <div className="upload-container">
      <DropZone onDrop={handleFileUpload} />
      <DocumentList documents={documents} />
    </div>
  );
};
```

### 2. Reusable Components (Components)

#### Navbar - Navigation Bar
```typescript
// Responsive navigation bar component
const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-brand">
        <Link to="/" aria-label={t('nav.home')}>
          <img src="/logo.svg" alt="Ottawa Logo" />
        </Link>
      </div>
      
      <div className="navbar-menu">
        <NavigationLinks />
        <LanguageToggle 
          current={language} 
          onChange={setLanguage}
        />
      </div>
    </nav>
  );
};
```

## 🌐 Internationalization Architecture (i18n)

### Language Context Management
```typescript
// Language context definition
interface LanguageContextType {
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data structure
const translations = {
  en: {
    'app.title': 'Ottawa GenAI Research Assistant',
    'nav.home': 'Home',
    'nav.chat': 'Chat',
    'features.qa.title': 'Natural Language Q&A',
    // ... more English translations
  },
  fr: {
    'app.title': 'Assistant de Recherche GenAI d\'Ottawa',
    'nav.home': 'Accueil',
    'nav.chat': 'Chat',
    'features.qa.title': 'Q&R en Langage Naturel',
    // ... more French translations
  }
};

// Translation function implementation
const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
```

### Language Switching Functionality
```typescript
// Language toggle component
const LanguageToggle: React.FC<{
  current: 'en' | 'fr';
  onChange: (lang: 'en' | 'fr') => void;
}> = ({ current, onChange }) => {
  return (
    <div className="language-toggle" role="group" aria-label="Language selection">
      <button
        className={current === 'en' ? 'active' : ''}
        onClick={() => onChange('en')}
        aria-pressed={current === 'en'}
      >
        EN
      </button>
      <button
        className={current === 'fr' ? 'active' : ''}
        onClick={() => onChange('fr')}
        aria-pressed={current === 'fr'}
      >
        FR
      </button>
    </div>
  );
};
```

## 🔌 API Service Architecture

### Standard API Service (api.ts)
```typescript
// Standard RESTful API calls
class ApiService {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': this.getCurrentLanguage(),
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': this.getCurrentLanguage(),
      },
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<T>(response);
  }
  
  // Document upload
  async uploadDocument(file: File, options?: {
    onProgress?: (progress: number) => void;
  }): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.uploadWithProgress('/documents/upload', formData, options);
  }
  
  // Chat message sending
  async sendChatMessage(message: string): Promise<ChatResponse> {
    return this.post('/chat/send', { message });
  }
}

export const api = new ApiService();
```

### Hybrid API Service (hybridApi.ts)
```typescript
// Hybrid service supporting both mock data and real APIs
class HybridApiService {
  private useMockData = process.env.REACT_APP_USE_MOCK === 'true';
  private apiService = new ApiService();
  
  async sendMessage(content: string): Promise<ChatMessage> {
    if (this.useMockData) {
      // Use mock data for rapid prototyping
      return this.generateMockResponse(content);
    } else {
      // Call real backend API
      return this.apiService.sendChatMessage(content);
    }
  }
  
  private generateMockResponse(input: string): ChatMessage {
    // Intelligent mock response generation
    const mockResponses = {
      economic: "Based on Ottawa economic development data, the tech sector grew 15% in 2023...",
      investment: "Latest investment trends show significant attention to clean technology...",
      default: "Thank you for your question. Based on available data, I can provide the following analysis..."
    };
    
    const responseType = this.categorizeInput(input);
    return {
      id: Date.now().toString(),
      content: mockResponses[responseType] || mockResponses.default,
      type: 'assistant',
      timestamp: new Date(),
      metadata: {
        charts: this.generateMockCharts(responseType),
        sources: this.generateMockSources(responseType)
      }
    };
  }
}

export const hybridApi = new HybridApiService();
```

## 🎨 Style Architecture

### CSS Modularization Strategy
Each component has a corresponding CSS file, using BEM naming convention:

```css
/* HomePage.css */
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.home__hero {
  text-align: center;
  margin-bottom: 4rem;
}

.home__hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.home__features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.home__feature-card {
  background: var(--card-background);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--card-shadow);
  transition: transform 0.2s ease;
}

.home__feature-card:hover {
  transform: translateY(-4px);
}
```

### Responsive Design
```css
/* Mobile adaptation */
@media (max-width: 768px) {
  .home__hero-title {
    font-size: 2rem;
  }
  
  .home__features {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .navbar__menu {
    display: none;
  }
  
  .navbar__mobile-toggle {
    display: block;
  }
}

/* Large screen optimization */
@media (min-width: 1440px) {
  .home-container {
    max-width: 1400px;
  }
  
  .home__features {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## ♿ Accessibility Design (WCAG 2.1)

### Semantic HTML Structure
```typescript
// Proper use of ARIA labels and semantic elements
const ChatPage: React.FC = () => {
  return (
    <main role="main" aria-label="Chat interface">
      <section aria-label="Message history">
        <h2 className="sr-only">Chat messages</h2>
        <div 
          role="log" 
          aria-live="polite" 
          aria-label="Chat message list"
          className="messages-container"
        >
          {messages.map(message => (
            <div 
              key={message.id}
              role="article"
              aria-label={`${message.type === 'user' ? 'User' : 'Assistant'} message`}
              className={`message message--${message.type}`}
            >
              {message.content}
            </div>
          ))}
        </div>
      </section>
      
      <section aria-label="Message input">
        <form onSubmit={handleSubmit} role="form">
          <label htmlFor="message-input" className="sr-only">
            Enter your question
          </label>
          <input
            id="message-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your question..."
            aria-describedby="input-help"
            required
          />
          <div id="input-help" className="sr-only">
            Press Enter to send message, supports English and French
          </div>
          <button 
            type="submit" 
            aria-label="Send message"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </section>
    </main>
  );
};
```

### Keyboard Navigation Support
```typescript
// Keyboard shortcut support
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to open search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Open search dialog
      }
      
      // ESC to close dialogs
      if (event.key === 'Escape') {
        // Close current modal
      }
      
      // Tab navigation support
      if (event.key === 'Tab') {
        // Ensure focus visibility
        document.body.classList.add('keyboard-navigation');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};
```

## 📱 Responsive Architecture

### Mobile-First Design
```typescript
// Responsive Hook
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width,
        height: window.innerHeight,
      });
      
      if (width < 768) {
        setDevice('mobile');
      } else if (width < 1024) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return { screenSize, device };
};
```

### Adaptive Components
```typescript
// Responsive navigation component
const ResponsiveNavbar: React.FC = () => {
  const { device } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  if (device === 'mobile') {
    return (
      <MobileNavbar 
        isOpen={mobileMenuOpen}
        onToggle={setMobileMenuOpen}
      />
    );
  }
  
  return <DesktopNavbar />;
};
```

## 🚀 Performance Optimization Strategies

### 1. Code Splitting
```typescript
// Route-level lazy loading
const HomePage = lazy(() => import('./pages/HomePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const DocumentUploadPage = lazy(() => import('./pages/DocumentUploadPage'));

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/upload" element={<DocumentUploadPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
```

### 2. Component Optimization
```typescript
// React.memo for re-render optimization
const MessageItem = React.memo<{
  message: ChatMessage;
  onEdit?: (id: string) => void;
}>(({ message, onEdit }) => {
  return (
    <div className="message-item">
      <div className="message-content">{message.content}</div>
      {onEdit && (
        <button onClick={() => onEdit(message.id)}>
          Edit
        </button>
      )}
    </div>
  );
});

// useCallback for function reference optimization
const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const handleSendMessage = useCallback(async (content: string) => {
    const newMessage = await api.sendMessage(content);
    setMessages(prev => [...prev, newMessage]);
  }, []);
  
  const handleEditMessage = useCallback((id: string) => {
    // Edit message logic
  }, []);
  
  return (
    <div>
      {messages.map(message => (
        <MessageItem
          key={message.id}
          message={message}
          onEdit={handleEditMessage}
        />
      ))}
    </div>
  );
};
```

### 3. Virtual Scrolling
```typescript
// Virtual scrolling optimization for long lists
const VirtualizedMessageList: React.FC<{
  messages: ChatMessage[];
}> = ({ messages }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, clientHeight } = containerRef.current;
    const itemHeight = 100; // Estimated message height
    
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(clientHeight / itemHeight) + 5,
      messages.length
    );
    
    setVisibleRange({ start, end });
  }, [messages.length]);
  
  const visibleMessages = messages.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div
      ref={containerRef}
      className="message-list"
      onScroll={handleScroll}
      style={{ height: '400px', overflowY: 'auto' }}
    >
      <div style={{ height: visibleRange.start * 100 }} />
      {visibleMessages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div style={{ height: (messages.length - visibleRange.end) * 100 }} />
    </div>
  );
};
```

## 🧪 Testing Architecture

### Component Testing Strategy
```typescript
// HomePage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { LanguageProvider } from '../contexts/LanguageContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        {component}
      </LanguageProvider>
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  test('renders welcome message', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/Ottawa Economic Development/)).toBeInTheDocument();
  });
  
  test('language switching works', () => {
    renderWithProviders(<HomePage />);
    
    const frenchButton = screen.getByText('FR');
    fireEvent.click(frenchButton);
    
    expect(screen.getByText(/Développement Économique/)).toBeInTheDocument();
  });
  
  test('navigation links are accessible', () => {
    renderWithProviders(<HomePage />);
    
    const chatLink = screen.getByRole('link', { name: /chat/i });
    expect(chatLink).toHaveAttribute('href', '/chat');
  });
});
```

### API Service Testing
```typescript
// api.test.ts
import { api } from './api';

// Mock fetch
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });
  
  test('sends chat message correctly', async () => {
    const mockResponse = {
      id: '1',
      content: 'Test response',
      type: 'assistant'
    };
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });
    
    const result = await api.sendChatMessage('Hello');
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/chat/send',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      })
    );
    
    expect(result).toEqual(mockResponse);
  });
});
```

## 🔧 Development Tools Configuration

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/pages/*": ["pages/*"],
      "@/services/*": ["services/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🎯 Architecture Advantages

### 1. 🧩 Modular Design
- **High Component Reusability**: Common components can be used across multiple pages
- **Strong Code Maintainability**: Clear file structure and naming conventions
- **Convenient Feature Extension**: New features can be developed and tested independently

### 2. 🌐 Internationalization Support
- **Complete Bilingual Support**: Seamless switching between English and French
- **Dynamic Language Loading**: Load translation files on demand
- **Cultural Localization**: Support for regional format differences

### 3. ♿ Accessibility First
- **WCAG 2.1 Compatible**: Complies with latest accessibility standards
- **Keyboard Navigation**: Complete keyboard operation support
- **Screen Reader Friendly**: Proper use of ARIA labels

### 4. 📱 Responsive Optimization
- **Mobile First**: Design starting from small screens
- **Adaptive Layout**: Adapts to various device sizes
- **Touch Friendly**: Optimized mobile device interaction

### 5. ⚡ Performance Optimization
- **Code Splitting**: Reduces initial loading time
- **Lazy Loading**: Load components and resources on demand
- **Virtual Scrolling**: Handle large data display

## 🚀 Running and Deployment

### Development Environment Startup
```bash
cd frontend
npm install
npm start
```

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker build -t ottawa-genai-frontend .
docker run -p 80:80 ottawa-genai-frontend
```

## 📝 Development Best Practices

### 1. Component Development Standards
- Use TypeScript for type definitions
- Follow React Hooks best practices
- Implement appropriate error boundaries
- Write unit tests

### 2. Style Standards
- Use CSS variables to define themes
- Follow BEM naming conventions
- Implement responsive design
- Optimize CSS performance

### 3. State Management
- Proper use of Context API
- Avoid unnecessary re-renders
- Implement appropriate caching strategies
- Handle asynchronous states

### 4. Testing Strategy
- Write component unit tests
- Implement integration tests
- Conduct accessibility testing
- Performance testing and optimization

## 🔄 Future Extension Plans

### 1. PWA Support
- Offline functionality support
- Push notifications
- Install to home screen

### 2. Advanced Features
- Real-time collaboration
- Voice input
- Advanced chart components
- Data visualization

### 3. Technology Upgrades
- Full utilization of React 18 features
- New state management solutions
- Better build tools
- Performance monitoring integration

This frontend architecture ensures application scalability, maintainability, and user experience optimization, while meeting Ottawa's municipal government requirements for bilingual support and accessible access. 