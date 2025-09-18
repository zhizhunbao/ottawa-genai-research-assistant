# Data Management Guide

This guide provides detailed instructions on how to manage, configure, and handle both Mock data and User Authentication data in the Ottawa GenAI Research Assistant application.

## 📚 Table of Contents

- [User Authentication Data Management](#user-authentication-data-management)
- [Mock Data Overview](#mock-data-overview)
- [Data Structure Details](#data-structure-details)
- [Google OAuth Integration](#google-oauth-integration)
- [JWT Token Management](#jwt-token-management)
- [User Session Persistence](#user-session-persistence)
- [How to Switch Mock Data](#how-to-switch-mock-data)
- [Custom Mock Data](#custom-mock-data)
- [Data Update Strategies](#data-update-strategies)
- [Debugging and Testing](#debugging-and-testing)
- [Migration to Backend API](#migration-to-backend-api)

## 🔐 User Authentication Data Management

The application now includes a comprehensive user authentication system with Google OAuth 2.0 integration and JWT token management.

### 📁 Authentication File Structure
```
backend/
├── app/
│   ├── api/
│   │   └── auth.py              # Authentication endpoints
│   ├── core/
│   │   └── auth.py              # JWT and auth utilities
│   ├── services/
│   │   └── auth_service.py      # Authentication business logic
│   └── repositories/
│       └── user_repository.py   # User data access layer
└── monk/
    └── users/
        └── users.json           # User data storage

frontend/
├── src/
│   ├── components/auth/
│   │   ├── GoogleLoginButton.tsx  # Google OAuth component
│   │   └── ProtectedRoute.tsx     # Route protection
│   ├── contexts/
│   │   └── AuthContext.tsx        # Authentication state
│   ├── config/
│   │   └── googleAuth.ts          # Google OAuth config
│   └── services/
│       └── authService.ts         # Frontend auth service
└── .env.local                     # Environment variables
```

### 👤 User Data Structure

```typescript
interface User {
  id: string;                    // UUID v4
  email: string;                 // User email (from Google)
  name: string;                  // Full name (from Google)
  avatar_url?: string;           // Profile picture URL
  google_id: string;             // Google account ID
  role: 'user' | 'admin';        // User role
  created_at: string;            // ISO datetime
  updated_at: string;            // ISO datetime
  last_login?: string;           // Last login timestamp
  is_active: boolean;            // Account status
}
```

### 🔑 JWT Token Structure

```typescript
interface JWTPayload {
  sub: string;                   // User ID (subject)
  email: string;                 // User email
  name: string;                  // User name
  exp: number;                   // Expiration timestamp
  iat: number;                   // Issued at timestamp
  iss: string;                   // Issuer (app name)
}
```

### 🌐 Google OAuth Configuration

```typescript
// frontend/src/config/googleAuth.ts
export const GOOGLE_CONFIG = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
  redirectUri: `${window.location.origin}/auth/callback`,
  scope: 'openid email profile',
  responseType: 'code',
};

// Environment variables setup
// .env.local file:
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 🔄 Authentication Flow Management

#### **1. Google OAuth Login Process**
```typescript
// GoogleLoginButton.tsx implementation
const handleGoogleLogin = async (credentialResponse: any) => {
  try {
    // Send Google credential to backend
    const response = await authService.googleLogin(credentialResponse.credential);
    
    // Extract JWT token and user info
    const { token, user } = response.data;
    
    // Store token and update auth state
    authService.setToken(token);
    setAuthState({ user, token, isAuthenticated: true });
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

#### **2. Backend Authentication Validation**
```python
# backend/app/api/auth.py
@router.post("/google")
async def google_auth(token_data: GoogleTokenRequest):
    try:
        # Validate Google token
        user_info = await verify_google_token(token_data.credential)
        
        # Get or create user
        user = await user_service.get_or_create_google_user(user_info)
        
        # Generate JWT token
        jwt_token = create_jwt_token(user)
        
        return {"token": jwt_token, "user": user}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")
```

#### **3. JWT Token Validation**
```python
# backend/app/core/auth.py
def verify_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 💾 User Data Persistence

#### **JSON-Based Storage (Current Implementation)**
```json
// backend/monk/users/users.json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar_url": "https://lh3.googleusercontent.com/...",
      "google_id": "123456789012345678901",
      "role": "user",
      "created_at": "2025-09-18T10:30:00Z",
      "updated_at": "2025-09-18T10:30:00Z",
      "last_login": "2025-09-18T10:30:00Z",
      "is_active": true
    }
  ]
}
```

#### **User Management Operations**
```python
# backend/app/services/user_service.py
class UserService:
    async def get_or_create_google_user(self, google_user_info: dict) -> User:
        # Check if user exists by Google ID
        existing_user = await self.repository.get_by_google_id(google_user_info['sub'])
        
        if existing_user:
            # Update last login
            existing_user.last_login = datetime.utcnow()
            return await self.repository.update(existing_user)
        else:
            # Create new user
            new_user = User(
                email=google_user_info['email'],
                name=google_user_info['name'],
                avatar_url=google_user_info.get('picture'),
                google_id=google_user_info['sub'],
                role='user'
            )
            return await self.repository.create(new_user)
```

## �� Mock Data Overview

The Mock data layer is located in the `ottawa-genai-prototype/src/mock/` directory, providing a complete set of simulated data that supports all prototype functionality without requiring a real backend.

### 📁 File Structure
```
ottawa-genai-prototype/src/mock/
├── api/
│   └── mockApi.ts           # Mock API endpoint implementation
├── data/                    # All Mock data files
│   ├── charts.ts           # Chart data
│   ├── files.ts            # File upload data
│   ├── messages.ts         # Chat message data
│   ├── reports.ts          # Report data
│   ├── stats.ts            # Statistics data
│   ├── translations.ts     # Multi-language translations
│   └── index.ts            # Data exports
├── types/
│   └── index.ts            # TypeScript type definitions
└── index.ts                # Mock layer exports
```

## 📊 Data Structure Details

### 1. Report Data (`reports.ts`)

```typescript
interface Report {
  id: string;                              // Unique identifier
  title: string;                          // Report title
  generatedAt: Date;                      // Generation time
  type: 'summary' | 'analysis' | 'trend'; // Report type
  status: 'completed' | 'processing' | 'error'; // Status
}
```

**Current Mock Data**:
- Q1 2024 Economic Development Summary
- Small Business Growth Analysis  
- Employment Trends Report

**How to add new reports**:
```typescript
export const mockReports: Report[] = [
  // ... existing reports
  {
    id: '4', // Ensure unique ID
    title: 'Q2 2024 Technology Sector Analysis',
    generatedAt: new Date('2024-04-15'),
    type: 'analysis',
    status: 'completed'
  }
];
```

### 2. Chat Message Data (`messages.ts`)

```typescript
interface Message {
  id: string;           // Message ID
  type: 'user' | 'assistant'; // Message type
  content: string;      // Message content
  timestamp: Date;      // Timestamp
  chart?: any;          // Optional chart data
  hasChart?: boolean;   // Whether includes chart
}
```

**Preset Response Patterns**:
- `business`: Business growth analysis
- `employment`: Employment trend analysis
- `default`: Default help information

**Custom AI Responses**:
```typescript
export const mockResponsePatterns = {
  // Add new response patterns
  housing: {
    content: `## Housing Market Analysis
    
### Key Indicators:
- **New Housing**: Growth 12.5%
- **Average Price**: $485,000 (+3.2%)
- **Rental Market**: Vacancy rate 4.1%
    
### Trend Analysis:
Housing demand continues to grow, especially in the tech corridor area...`,
    hasChart: true,
    chart: [/* housing data */]
  }
};
```

### 3. File Upload Data (`files.ts`)

```typescript
interface UploadedFile {
  id: string;                                    // File ID
  name: string;                                  // File name
  size: number;                                  // File size (bytes)
  type: string;                                  // MIME type
  status: 'uploading' | 'completed' | 'error';  // Upload status
  progress: number;                              // Upload progress (0-100)
  uploadedAt: Date;                             // Upload time
}
```

**Adding new files**:
```typescript
export const mockUploadedFiles: UploadedFile[] = [
  // ... existing files
  {
    id: '3',
    name: 'Tourism Impact Study.pdf',
    size: 3200000,
    type: 'application/pdf',
    status: 'completed',
    progress: 100,
    uploadedAt: new Date('2024-02-01')
  }
];
```

### 4. Statistics Data (`stats.ts`)

```typescript
interface StatData {
  number: string;  // Statistical number
  label: string;   // Statistical label
}
```

**Current Statistics**:
- 10+ Documents Processed
- 500+ Questions Answered
- 2 Languages Supported  
- 100% WCAG Compliant

### 5. Chart Data (`charts.ts`)

Contains various visualization data:

**Business Growth Data**:
```typescript
businessGrowth: [
  { month: 'Jan', businesses: 120, growth: 5.2 },
  { month: 'Feb', businesses: 125, growth: 6.1 },
  // ...
]
```

**Sector Analysis Data**:
```typescript
sectorAnalysis: [
  { sector: 'Technology', growth: 22, businesses: 145 },
  { sector: 'Healthcare', growth: 18, businesses: 98 },
  // ...
]
```

**Employment Distribution Data**:
```typescript
employmentDistribution: [
  { name: 'Full-time', value: 65, color: '#667eea' },
  { name: 'Part-time', value: 25, color: '#10b981' },
  // ...
]
```

### 6. Multi-language Translations (`translations.ts`)

```typescript
interface Translations {
  [language: string]: {
    [key: string]: string;
  };
}
```

**Supported Languages**: English (en), Français (fr)

**Adding new translations**:
```typescript
export const mockTranslations: Translations = {
  en: {
    // ... existing translations
    'reports.new': 'New Report Generated',
    'analysis.complete': 'Analysis Complete'
  },
  fr: {
    // ... existing translations  
    'reports.new': 'Nouveau Rapport Généré',
    'analysis.complete': 'Analyse Terminée'
  }
};
```

## 🔐 User Authentication Data Management

### 📋 **User Data Infrastructure (Ready for Authentication)**

The Ottawa GenAI Research Assistant already has a comprehensive user management system built into the backend, providing a solid foundation for implementing authentication.

#### **Existing User Data Structure**

**Location:** `backend/monk/users/users.json`

```typescript
interface User {
  id: string;                              // Unique user identifier
  username: string;                        // Login username
  email: string;                          // User email address
  role: 'researcher' | 'analyst' | 'admin'; // User role
  status: 'active' | 'inactive' | 'suspended'; // Account status
  created_at: string;                     // Account creation date
  last_login?: string;                    // Last login timestamp
  preferences: {                          // User preferences
    language: 'en' | 'fr';               // Interface language
    theme: 'light' | 'dark' | 'auto';    // Theme preference
    notifications: boolean;               // Notification settings
    default_topics: string[];            // Default research topics
  };
  metadata: {                             // User metadata
    department?: string;                  // User department
    access_level: 'standard' | 'advanced' | 'admin'; // Access level
  };
}
```

#### **Pre-configured Test Users**

```json
[
  {
    "id": "user_001",
    "username": "john_researcher",
    "email": "john@ottawa.ca",
    "role": "researcher",
    "status": "active",
    "preferences": {
      "language": "en",
      "theme": "light",
      "default_topics": ["economic", "business"]
    },
    "metadata": {
      "department": "Economic Development",
      "access_level": "standard"
    }
  },
  {
    "id": "user_002",
    "username": "marie_analyst", 
    "email": "marie@ottawa.ca",
    "role": "analyst",
    "status": "active",
    "preferences": {
      "language": "fr",
      "theme": "dark",
      "default_topics": ["business", "innovation"]
    },
    "metadata": {
      "department": "Business Development",
      "access_level": "advanced"
    }
  },
  {
    "id": "user_003",
    "username": "admin_user",
    "email": "admin@ottawa.ca",
    "role": "admin", 
    "status": "active",
    "preferences": {
      "language": "en",
      "theme": "light",
      "default_topics": ["all"]
    },
    "metadata": {
      "department": "IT Services",
      "access_level": "admin"
    }
  }
]
```

### 🔑 **Authentication Data Management**

#### **Session Management (To Be Implemented)**

```typescript
interface UserSession {
  session_id: string;        // Unique session identifier
  user_id: string;          // Associated user ID
  username: string;         // User username for quick access
  role: string;             // User role for authorization
  created_at: Date;         // Session creation time
  expires_at: Date;         // Session expiration time
  last_activity: Date;      // Last activity timestamp
  is_active: boolean;       // Session status
}
```

#### **JWT Token Structure (Planned)**

```typescript
interface JWTPayload {
  sub: string;              // Subject (user_id)
  username: string;         // Username
  role: string;             // User role
  access_level: string;     // Access level
  department?: string;      // User department
  iat: number;              // Issued at
  exp: number;              // Expiration time
}
```

### 🚀 **Authentication Implementation Strategy**

#### **Phase 1: Simple Username Authentication**

**For rapid deployment, implement username-only authentication:**

1. **Login Process:**
   ```typescript
   // User selects from dropdown of available users
   const availableUsers = [
     { username: 'john_researcher', display: 'John (Economic Development)' },
     { username: 'marie_analyst', display: 'Marie (Business Development)' },
     { username: 'admin_user', display: 'Admin (IT Services)' }
   ];
   ```

2. **Session Creation:**
   ```typescript
   // Create session after user selection
   const session = {
     session_id: generateUUID(),
     user_id: selectedUser.id,
     username: selectedUser.username,
     role: selectedUser.role,
     created_at: new Date(),
     expires_at: new Date(Date.now() + 3600000), // 1 hour
     is_active: true
   };
   ```

#### **Phase 2: Enhanced Security (Future)**

**For production deployment, add password authentication:**

```typescript
interface UserCredentials {
  username: string;
  password_hash: string;    // bcrypt hashed password
  salt: string;            // Password salt
  password_changed_at: Date; // Last password change
  failed_login_attempts: number; // Failed login counter
  locked_until?: Date;     // Account lock expiration
}
```

### 📊 **Role-Based Data Access**

#### **Data Isolation by Role:**

| Data Type | Researcher | Analyst | Admin |
|-----------|------------|---------|-------|
| **Own Chat History** | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write |
| **Own Documents** | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write |
| **Own Reports** | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write |
| **Other Users' Data** | ❌ No Access | ❌ No Access | ✅ Read Only |
| **System Settings** | ❌ No Access | ❌ No Access | ✅ Read/Write |
| **User Management** | ❌ No Access | ❌ No Access | ✅ Full Access |

#### **Data Structure with User Association:**

```typescript
// Chat messages with user context
interface ChatMessage {
  id: string;
  user_id: string;          // Associated user
  conversation_id: string;   // Conversation grouping
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chart?: any;
}

// Documents with ownership
interface Document {
  id: string;
  uploaded_by: string;      // User ID who uploaded
  filename: string;
  access_level: 'private' | 'department' | 'public';
  // ... other fields
}

// Reports with creator tracking
interface Report {
  id: string;
  created_by: string;       // User ID who created
  title: string;
  generated_at: Date;
  access_level: 'private' | 'department' | 'public';
  // ... other fields
}
```

### 🔧 **Implementation Steps for Authentication**

#### **Step 1: Update Backend User Service**

```python
# backend/app/api/auth.py (New file)
from fastapi import APIRouter, HTTPException, Depends
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/login")
async def login(username: str):
    # Simplified login for Phase 1
    user = await auth_service.authenticate_user(username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Create session and JWT token
    token = await auth_service.create_token(user)
    return {"access_token": token, "token_type": "bearer", "user": user}
```

#### **Step 2: Add Frontend Authentication Context**

```typescript
// frontend/src/contexts/AuthContext.tsx (New file)
interface AuthContextType {
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Authentication logic implementation
  // ...
};
```

#### **Step 3: Protect Routes**

```typescript
// frontend/src/components/ProtectedRoute.tsx (New file)
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission
}) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <div>Access Denied</div>;
  }
  
  return <>{children}</>;
};
```

### 🛡️ **Security Best Practices**

#### **Session Security:**
- **Timeout Management:** 60-minute sessions with activity-based renewal
- **Secure Storage:** HTTPOnly cookies for session tokens
- **CSRF Protection:** Anti-CSRF tokens for state-changing operations
- **Session Invalidation:** Proper logout and session cleanup

#### **Data Protection:**
- **User Isolation:** Users can only access their own data
- **Role Validation:** Server-side role verification for all operations
- **Audit Logging:** Log all authentication and authorization events
- **Input Validation:** Sanitize all user inputs

#### **Government Compliance:**
- **Access Logging:** Track all user activities for audit purposes
- **Data Retention:** Configurable retention policies for user data
- **Privacy Protection:** No storage of sensitive personal information
- **Security Headers:** Implement appropriate HTTP security headers

## �� How to Switch Mock Data

### 1. Control through Environment Variables

```bash
# Use Mock data (development/demo)
export REACT_APP_API_STRATEGY=mock

# Hybrid mode (recommended for development stage)
export REACT_APP_API_STRATEGY=hybrid

# Real API (production environment)
export REACT_APP_API_STRATEGY=real
```

### 2. Dynamic Data Switching

If you need to switch between different Mock data sets at runtime:

```typescript
// Create multiple data sets
export const mockDataSets = {
  demo: {
    reports: demoReports,
    messages: demoMessages,
    stats: demoStats
  },
  development: {
    reports: devReports, 
    messages: devMessages,
    stats: devStats
  },
  testing: {
    reports: testReports,
    messages: testMessages,
    stats: testStats
  }
};

// Select data set based on environment in mockApi.ts
const getCurrentDataSet = () => {
  const env = process.env.REACT_APP_MOCK_DATA_SET || 'demo';
  return mockDataSets[env] || mockDataSets.demo;
};
```

### 3. Time-based Dynamic Data

Create time-based dynamic Mock data:

```typescript
// Generate reports with dynamic dates
const generateDynamicReports = (): Report[] => {
  const now = new Date();
  return [
    {
      id: '1',
      title: `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()} Economic Summary`,
      generatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      type: 'summary',
      status: 'completed'
    }
    // ...
  ];
};
```

## ✨ Custom Mock Data

### 1. Creating New Data Types

1. **Define TypeScript Interface** (`src/mock/types/index.ts`):
```typescript
export interface ProjectData {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'pending';
  budget: number;
  startDate: Date;
  department: string;
}
```

2. **Create Mock Data File** (`src/mock/data/projects.ts`):
```typescript
import { ProjectData } from '../types';

export const mockProjects: ProjectData[] = [
  {
    id: '1',
    name: 'Downtown Revitalization',
    status: 'active', 
    budget: 2500000,
    startDate: new Date('2024-01-01'),
    department: 'Urban Planning'
  }
  // ...
];
```

3. **Add API Endpoint** (`src/mock/api/mockApi.ts`):
```typescript
import { mockProjects } from '../data/projects';

export const mockApi = {
  // ... existing endpoints
  
  async getProjects(): Promise<ProjectData[]> {
    await delay(300);
    return mockProjects;
  },
  
  async getProject(id: string): Promise<ProjectData | null> {
    await delay(200);
    return mockProjects.find(p => p.id === id) || null;
  }
};
```

### 2. Advanced Mock Data Features

**Search and Filtering**:
```typescript
async searchReports(query: string): Promise<Report[]> {
  await delay(400);
  return mockReports.filter(report => 
    report.title.toLowerCase().includes(query.toLowerCase())
  );
}
```

**Pagination Support**:
```typescript
async getReportsPaginated(page: number = 1, limit: number = 10): Promise<{
  reports: Report[];
  total: number;
  hasMore: boolean;
}> {
  await delay(500);
  const start = (page - 1) * limit;
  const end = start + limit;
  const reports = mockReports.slice(start, end);
  
  return {
    reports,
    total: mockReports.length,
    hasMore: end < mockReports.length
  };
}
```

**State Simulation**:
```typescript
async generateReport(type: string): Promise<Report> {
  const report: Report = {
    id: Date.now().toString(),
    title: `${type} Report - ${new Date().toLocaleDateString()}`,
    generatedAt: new Date(),
    type: type as any,
    status: 'processing'
  };
  
  // Simulate processing
  setTimeout(() => {
    report.status = 'completed';
  }, 3000);
  
  return report;
}
```

## 📈 Data Update Strategies

### 1. Real-time Data Simulation

```typescript
// Simulate real-time statistics updates
class MockDataManager {
  private updateInterval: NodeJS.Timeout;
  
  constructor() {
    this.startRealtimeUpdates();
  }
  
  private startRealtimeUpdates() {
    this.updateInterval = setInterval(() => {
      // Update statistics data
      mockStats[0].number = `${Math.floor(Math.random() * 100) + 10}+`;
      mockStats[1].number = `${Math.floor(Math.random() * 1000) + 500}+`;
      
      // Trigger update event
      window.dispatchEvent(new CustomEvent('mockDataUpdate'));
    }, 30000); // Update every 30 seconds
  }
  
  stopUpdates() {
    clearInterval(this.updateInterval);
  }
}
```

### 2. User Interaction Response

```typescript
// Update data based on user actions
const simulateUserImpact = (action: string) => {
  switch (action) {
    case 'upload_file':
      mockStats[0].number = `${parseInt(mockStats[0].number) + 1}+`;
      break;
    case 'ask_question':
      mockStats[1].number = `${parseInt(mockStats[1].number) + 1}+`;
      break;
  }
};
```

## 🧪 Debugging and Testing

### 1. Mock Data Validation

```typescript
// Data validation tools
const validateMockData = () => {
  const issues = [];
  
  // Check ID uniqueness
  const reportIds = mockReports.map(r => r.id);
  const uniqueIds = [...new Set(reportIds)];
  if (reportIds.length !== uniqueIds.length) {
    issues.push('Duplicate report IDs found');
  }
  
  // Check required fields
  mockReports.forEach(report => {
    if (!report.title || !report.id) {
      issues.push(`Invalid report: ${report.id}`);
    }
  });
  
  return issues;
};

// Run validation in development mode
if (process.env.NODE_ENV === 'development') {
  const issues = validateMockData();
  if (issues.length > 0) {
    console.warn('Mock data issues:', issues);
  }
}
```

### 2. Data Export Tools

```typescript
// Export Mock data for analysis
const exportMockData = () => {
  const data = {
    reports: mockReports,
    files: mockUploadedFiles,
    stats: mockStats,
    translations: mockTranslations,
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mock-data-${Date.now()}.json`;
  a.click();
};
```

### 3. A/B Testing Support

```typescript
// Support different versions of Mock data
const getTestVariant = () => {
  const userId = localStorage.getItem('userId') || 'anonymous';
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return Math.abs(hash) % 2 === 0 ? 'A' : 'B';
};

const getMockDataForVariant = (variant: string) => {
  return variant === 'A' ? mockDataVariantA : mockDataVariantB;
};
```

## 🎛️ Configuration Options

Add Mock data configuration in `.env` file:

```bash
# Mock data configuration
REACT_APP_API_STRATEGY=mock
REACT_APP_MOCK_DATA_SET=demo
REACT_APP_MOCK_DELAY_MIN=200
REACT_APP_MOCK_DELAY_MAX=800
REACT_APP_MOCK_ERROR_RATE=0.05
REACT_APP_ENABLE_MOCK_LOGS=true
```

Use configuration in code:

```typescript
const mockConfig = {
  dataSet: process.env.REACT_APP_MOCK_DATA_SET || 'demo',
  delayMin: parseInt(process.env.REACT_APP_MOCK_DELAY_MIN || '200'),
  delayMax: parseInt(process.env.REACT_APP_MOCK_DELAY_MAX || '800'),
  errorRate: parseFloat(process.env.REACT_APP_MOCK_ERROR_RATE || '0'),
  enableLogs: process.env.REACT_APP_ENABLE_MOCK_LOGS === 'true'
};
```

## 🚀 Best Practices

### 1. Data Consistency
- Maintain ID uniqueness
- Use consistent date formats
- Ensure referential integrity

### 2. Performance Optimization
- Use appropriate delays to simulate real networks
- Avoid overly large Mock data sets
- Implement data lazy loading

### 3. Maintainability
- Regularly update Mock data
- Keep consistency with real APIs
- Add data version control

### 4. Test Coverage
- Test various data states
- Simulate error conditions
- Validate edge cases

## 🔄 Migration to Backend API

When prototype development is complete and real backend API integration is needed, the Mock data layer design makes migration smooth and gradual.

### 1. API Strategy Configuration

The project supports three API strategies for gradual migration:

```bash
# 1. Pure Mock mode (prototype stage)
REACT_APP_API_STRATEGY=mock

# 2. Hybrid mode (migration stage)
REACT_APP_API_STRATEGY=hybrid

# 3. Real API mode (production stage)
REACT_APP_API_STRATEGY=real
```

### 2. Progressive Migration Steps

#### Step 1: Establish API Contract

First, define real API interface specifications based on Mock data:

```typescript
// src/api/types.ts - API contract definition
export interface ApiReport {
  id: string;
  title: string;
  generatedAt: string; // ISO 8601 format
  type: 'summary' | 'analysis' | 'trend';
  status: 'completed' | 'processing' | 'error';
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}
```

#### Step 2: Create API Adapter

```typescript
// src/api/realApi.ts - Real API implementation
export class RealApiService {
  private baseUrl = process.env.REACT_APP_API_BASE_URL;
  
  async getReports(): Promise<ApiResponse<ApiReport[]>> {
    const response = await fetch(`${this.baseUrl}/api/reports`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
  
  async generateReport(type: string): Promise<ApiResponse<ApiReport>> {
    const response = await fetch(`${this.baseUrl}/api/reports/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type })
    });
    
    return response.json();
  }
  
  private getToken(): string {
    return localStorage.getItem('auth_token') || '';
  }
}
```

#### Step 3: Create Unified Service Layer

```typescript
// src/services/dataService.ts - Unified data service
import { mockApi } from '../mock/api/mockApi';
import { RealApiService } from '../api/realApi';

export class DataService {
  private mockApi = mockApi;
  private realApi = new RealApiService();
  private strategy = process.env.REACT_APP_API_STRATEGY || 'mock';
  
  async getReports(): Promise<Report[]> {
    try {
      switch (this.strategy) {
        case 'mock':
          return await this.mockApi.getReports();
          
        case 'real':
          const response = await this.realApi.getReports();
          return this.transformApiReports(response.data);
          
        case 'hybrid':
          try {
            const response = await this.realApi.getReports();
            return this.transformApiReports(response.data);
          } catch (error) {
            console.warn('API failed, falling back to mock:', error);
            return await this.mockApi.getReports();
          }
          
        default:
          return await this.mockApi.getReports();
      }
    } catch (error) {
      if (this.strategy === 'hybrid') {
        console.warn('Using mock fallback due to error:', error);
        return await this.mockApi.getReports();
      }
      throw error;
    }
  }
  
  private transformApiReports(apiReports: ApiReport[]): Report[] {
    return apiReports.map(apiReport => ({
      id: apiReport.id,
      title: apiReport.title,
      generatedAt: new Date(apiReport.generatedAt),
      type: apiReport.type,
      status: apiReport.status
    }));
  }
}

// Create singleton instance
export const dataService = new DataService();
```

### 3. Migration Checklist

#### 🔍 Pre-migration Checks
- [ ] Are API endpoints defined and accessible?
- [ ] Is authentication mechanism implemented?
- [ ] Are data formats compatible with Mock data?
- [ ] Is error handling comprehensive?
- [ ] Are network timeout configurations reasonable?

#### 🧪 Testing Steps
1. **Hybrid Mode Testing**: Set `REACT_APP_API_STRATEGY=hybrid`
2. **API Availability Testing**: Verify all endpoints work properly
3. **Error Scenario Testing**: Test network disconnection, server errors, etc.
4. **Performance Testing**: Compare Mock and real API response times
5. **Data Consistency Testing**: Ensure API returns correct data format

#### 🚀 Deployment Steps
1. **Phase 1**: Use hybrid mode in development environment
2. **Phase 2**: Use real API in testing environment
3. **Phase 3**: Gradually switch modules in production environment
4. **Phase 4**: Completely switch to real API
5. **Phase 5**: Remove Mock code (optional)

---

Through this guide, you can fully control Mock data behavior, create rich prototype experiences, and prepare for migration to real APIs.

## 📚 Related Documentation

### 🏠 Main Project
- [📖 Main README](../README.md) - Project overview and quick start guide

### 📋 English Documentation
- [🏗️ System Architecture Guide](./System%20Architecture%20Guide.md) - Complete system architecture
- [📊 Project Status Report](./Project%20Status%20Report.md) - Current project status and progress
- [📋 Product Requirements Document (PRD)](./Product%20Requirements%20Document%20(PRD).md) - Product requirements and specifications

### 📋 Chinese Documentation | 中文文档
- [🏗️ 系统架构指南](./系统架构指南.md) - 系统架构说明（中文版）
- [🗄️ 数据管理指南](./数据管理指南.md) - 数据管理策略（中文版）
- [📊 项目现状报告](./项目现状报告.md) - 项目状态报告（中文版）
- [📋 产品需求文档（PRD）](./产品需求文档（PRD）.md) - 产品需求文档（中文版） 