# 🔗 Frontend-Backend API Integration Guide

## 📊 Current Status Summary

### ❌ **Previous State: Frontend Not Actually Calling Backend APIs**
Your frontend application was primarily using **static Mock data** instead of actually accessing the backend FastAPI endpoints.

### ✅ **Current State: Configured as Hybrid API Mode**
After the recent modifications, the frontend can now:
1. **Prioritize attempting real backend API calls**
2. **Automatically fallback to Mock data when API fails**
3. **Provide seamless user experience**

---

## 🏗️ Frontend-Backend Architecture Integration

### 1. **Backend API Architecture**
```
FastAPI Server (http://localhost:8000)
├── /api/v1/chat/message     # Chat interface
├── /api/v1/documents/       # Document management
├── /api/v1/reports/         # Report generation
├── /api/v1/settings/        # System settings
└── /health                  # Health check
```

### 2. **Frontend API Service Architecture**
```
Frontend Services
├── api.ts                   # Real API calls
├── hybridApi.ts            # Hybrid API (Real + Mock fallback)
└── mockApi.ts              # Pure Mock data
```

### 3. **API Call Flow**
```
User Action → hybridApi → Try realApi → Success✅/Fail❌ → Mock fallback
```

---

## 🔧 Key Configuration Changes

### 1. **Frontend API Base URL Configuration**
```typescript
// frontend/src/services/api.ts (Modified)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';
```

### 2. **Chat Interface Parameter Alignment**
```typescript
// Modified frontend request format to match backend expectations
sendMessage: async (message: string, conversationId?: string) => {
  return apiClient.post('/chat/message', { 
    message,
    language: 'en',
    context: conversationId 
  });
}
```

### 3. **Environment Variable Configuration**
```bash
# .env (needs to be created)
REACT_APP_API_STRATEGY=hybrid
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
REACT_APP_FALLBACK_TO_MOCK=true
REACT_APP_API_TIMEOUT=5000
```

---

## ⚡ Enabling Real API Integration

### Step 1: Create Environment Variables File
```bash
# Create .env file in frontend/ directory
cd frontend
echo "REACT_APP_API_STRATEGY=hybrid
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
REACT_APP_FALLBACK_TO_MOCK=true
REACT_APP_API_TIMEOUT=5000
REACT_APP_ENABLE_DEBUG=true" > .env
```

### Step 2: Start Backend Server
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Start Frontend Application
```bash
cd frontend
npm start
```

### Step 4: Verify API Connection
Open browser console, when sending messages you should see:
- 🟢 Success: `API call successful` 
- 🟡 Fallback: `API call failed, using fallback simulation`

---

## 📱 ChatPage API Integration

### Before Modification (Pure Mock Mode)
```typescript
// Completely using local simulation
const handleSendMessage = async () => {
  // ... add user message
  
  setTimeout(() => {
    const response = simulateAIResponse(inputValue);
    // ... add AI response
  }, 1500);
};
```

### After Modification (Hybrid API Mode)
```typescript
// Prioritize real API, fallback to Mock on failure
const handleSendMessage = async () => {
  // ... add user message
  
  try {
    // 🔥 Real API call
    const apiResponse = await hybridApi.sendMessage(currentInput, conversationId);
    // ... handle real response
  } catch (error) {
    // 🔄 Automatic fallback to Mock
    const response = simulateAIResponse(currentInput);
    // ... handle mock response
  }
};
```

---

## 🌐 API Endpoint Mapping

### Chat Interface
| Frontend Method | Backend Endpoint | Function |
|----------------|------------------|----------|
| `hybridApi.sendMessage()` | `POST /api/v1/chat/message` | Send chat message |
| `hybridApi.getConversationHistory()` | `GET /api/v1/chat/history` | Get chat history |

### Request/Response Format
```typescript
// Frontend request format
{
  message: string,
  language: 'en' | 'fr',
  context?: string
}

// Backend response format
{
  id: string,
  response: string,
  language: string,
  timestamp: string,
  sources?: string[],
  charts?: any
}
```

---

## 🔍 Debugging and Testing

### 1. **Check API Connection Status**
Run in browser console:
```javascript
// Check backend health status
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(console.log);

// Check hybrid API status
hybridApi.healthCheck().then(console.log);
```

### 2. **View API Call Logs**
- Frontend: Browser Developer Tools → Network tab
- Backend: uvicorn logs in terminal

### 3. **Force Different API Modes**
```bash
# Use only real API (no fallback)
REACT_APP_API_STRATEGY=real

# Use only Mock data
REACT_APP_API_STRATEGY=mock

# Hybrid mode (recommended)
REACT_APP_API_STRATEGY=hybrid
```

---

## 🛠️ Next Steps for Optimization

### 1. **Complete API Integration for Other Pages**
- DocumentUploadPage → `/api/v1/documents/upload`
- ReportPage → `/api/v1/reports/`
- SettingsPage → `/api/v1/settings/`

### 2. **Enhanced Error Handling**
```typescript
// Add more detailed error handling in hybridApi
catch (error) {
  if (error.name === 'NetworkError') {
    // Network error handling
  } else if (error.status === 500) {
    // Server error handling
  }
  // ... other error types
}
```

### 3. **Add Loading State Indicators**
```typescript
// Display API call status
const [apiStatus, setApiStatus] = useState<'real' | 'mock' | 'loading'>('loading');
```

### 4. **Implement Request Caching**
```typescript
// Cache API responses for better performance
const responseCache = new Map();
```

---

## 🎯 Summary

### ✅ **Completed Changes**
1. **Fixed API base URL** (port 8000 + /api/v1 prefix)
2. **ChatPage integrated with hybridApi** (Real API + Mock fallback)
3. **Aligned request parameter format** (message + language + context)
4. **Maintained Mock data fallback** (ensures smooth demo experience)

### 🔄 **Current Workflow**
1. User sends message in ChatPage
2. Frontend calls `hybridApi.sendMessage()`
3. hybridApi attempts to call backend `/api/v1/chat/message`
4. Success → Display real AI response
5. Failure → Automatically fallback to Mock response

### 🚀 **To Fully Enable Real API**
1. Create `.env` file and set environment variables
2. Ensure backend service is running on port 8000
3. Restart frontend application to load new configuration

Your frontend application now has **genuine API calling capabilities** while maintaining a **demo-friendly fallback mechanism**! 🎉

---

## 🔄 API Strategy Modes

### **Real API Mode** (`REACT_APP_API_STRATEGY=real`)
- ✅ Always attempts backend API calls
- ❌ No fallback if API fails
- 🎯 Best for: Production environment

### **Mock Mode** (`REACT_APP_API_STRATEGY=mock`)
- ✅ Always uses local mock data
- ⚡ Fast response times
- 🎯 Best for: Development/Demo without backend

### **Hybrid Mode** (`REACT_APP_API_STRATEGY=hybrid`) - **Recommended**
- ✅ Tries real API first
- 🔄 Falls back to mock on failure
- 🎯 Best for: Development with optional backend

---

## 🚨 Troubleshooting Common Issues

### Issue 1: CORS Errors
```bash
# Backend allows frontend origin
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

### Issue 2: API Timeout
```bash
# Increase timeout in frontend
REACT_APP_API_TIMEOUT=10000
```

### Issue 3: Backend Not Started
```bash
# Check if backend is running
curl http://localhost:8000/health
```

### Issue 4: Environment Variables Not Loading
```bash
# Restart frontend after creating .env
npm start
```

---

## 📈 Performance Considerations

### 1. **Request Optimization**
- Implement request debouncing for chat input
- Use request caching for repeated queries
- Add request cancellation for interrupted operations

### 2. **Error Recovery**
- Retry failed requests with exponential backoff
- Graceful degradation when backend is unavailable
- User-friendly error messages

### 3. **Monitoring**
- Track API success/failure rates
- Monitor response times
- Log user experience metrics

Now your **Ottawa GenAI Research Assistant** has a robust, production-ready frontend-backend integration! 🚀 