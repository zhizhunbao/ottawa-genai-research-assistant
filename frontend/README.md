# Ottawa GenAI Research Assistant

A smart research assistant prototype for Ottawa economic development, featuring AI-powered chat, document analysis, and data visualization.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## ✨ Features

- 🤖 AI-powered chat interface
- 📄 Document upload and analysis
- 📊 Data visualization and charts
- 🔐 Complete authentication system with login/register
- 🌐 Bilingual support (English/French)
- ♿ Accessibility compliant (WCAG 2.1)
- 📱 Responsive design

## 📚 Documentation

- [Mock Data Management Guide](./docs/Mock数据管理指南.md) - Comprehensive guide for managing mock data

## 🔧 Development

This is a React-based prototype with integrated mock data layer for rapid development and demonstration.

### API Strategy

The app supports different API strategies via environment variables:

```bash
# Mock mode (default)
REACT_APP_API_STRATEGY=mock

# Hybrid mode (real API with mock fallback)
REACT_APP_API_STRATEGY=hybrid

# Real API mode
REACT_APP_API_STRATEGY=real
```

### Mock Data Sets

Switch between different mock data sets for different scenarios:

```bash
# Available data sets
REACT_APP_MOCK_DATA_SET=demo          # Demo scenarios
REACT_APP_MOCK_DATA_SET=development   # Development data
REACT_APP_MOCK_DATA_SET=testing       # Testing edge cases
REACT_APP_MOCK_DATA_SET=showcase      # Best visual presentation
```

## 🔐 Authentication System

The app includes a complete authentication system with the following features:

### Demo Users

For demonstration purposes, you can use these pre-configured accounts:

```bash
# Admin User
Email: admin@ottawa.ca
Password: admin123

# Regular User  
Email: user@ottawa.ca
Password: user123

# Research User
Email: researcher@ottawa.ca
Password: researcher123
```

### Authentication Features

- **Login/Register Forms**: Beautiful, responsive forms with validation
- **User Management**: Complete user profile management
- **Role-based Access**: Admin, user, and researcher roles
- **Session Management**: Persistent login sessions with localStorage
- **Mock Authentication**: Fully functional authentication without backend
- **Security**: Password validation and error handling

### Testing Authentication

To test the authentication system:

1. Navigate to `/auth-demo` route (or create a component using `AuthDemo`)
2. Try logging in with the demo credentials above
3. Test registration with new user data
4. Observe user profile and session management

The authentication system is built with:
- **React Context** for state management
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Mock Service Layer** for realistic API simulation

## 🚢 Deployment

Deploy to Render using the included `render.yaml` configuration:

1. Push to GitHub
2. Connect to Render
3. Deploy automatically

## 📝 License

This project is developed for Ottawa Economic Development. 