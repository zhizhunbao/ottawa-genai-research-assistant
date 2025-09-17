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

## 🚢 Deployment

Deploy to Render using the included `render.yaml` configuration:

1. Push to GitHub
2. Connect to Render
3. Deploy automatically

## 📝 License

This project is developed for Ottawa Economic Development. 