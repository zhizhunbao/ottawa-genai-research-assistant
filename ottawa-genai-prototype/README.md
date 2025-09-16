# 🇨🇦 Ottawa GenAI Research Assistant - Prototype

A high-fidelity, interactive prototype for Ottawa's Economic Development team, built as part of the City Studio Program collaboration with Algonquin College AI courses.

## 📋 Project Overview

This prototype demonstrates a Generative AI research assistant that allows city government employees to:

- **Ask natural language questions** about economic development data
- **Upload and analyze PDF reports** automatically
- **Generate structured analysis reports** with visualizations
- **Access bilingual interface** (English/French)
- **Use accessibility-compliant features** (WCAG 2.1 AA)

## 🚀 Features

### 🏠 **Homepage**
- Modern hero section with floating animation cards
- Feature showcase with interactive elements
- Quick action buttons for easy navigation
- Responsive design for all device sizes

### 💬 **AI Chat Interface**
- Real-time conversation with AI assistant
- Interactive charts and data visualizations
- Markdown support for rich text responses
- Copy, share, and feedback capabilities
- Typing indicators and loading states

### 📄 **Document Upload**
- Drag-and-drop PDF upload functionality
- Real-time upload progress tracking
- File management with preview options
- Processing status indicators
- Usage guidelines and best practices

### 📊 **Report Generation**
- Automated analysis report creation
- Interactive data visualizations (charts, graphs)
- Executive summaries with key metrics
- Export capabilities (PDF/Word)
- Structured recommendations sections

### ⚙️ **Settings & Accessibility**
- Bilingual language switching (EN/FR)
- Theme selection (Light/Dark/Auto)
- Font size adjustments
- High contrast mode
- Animation reduction options
- WCAG 2.1 compliance information

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Markdown**: React Markdown
- **Styling**: CSS3 with modern features
- **Accessibility**: WCAG 2.1 AA compliant

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser

### Installation Steps

1. **Clone and navigate to the project**
   ```bash
   cd ottawa-genai-prototype
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage Guide

### Getting Started
1. **Explore the Homepage** - Overview of features and quick actions
2. **Try the Chat Interface** - Ask questions like:
   - "What are the latest business growth trends?"
   - "Show me employment statistics"
   - "What can you help me with?"
3. **Upload Documents** - Test the drag-and-drop PDF upload
4. **View Sample Reports** - Explore generated analysis reports
5. **Customize Settings** - Try language switching and accessibility features

### Sample Questions to Try
- **Business Analytics**: "Analyze Q1 business registration trends"
- **Employment Data**: "What are the current unemployment rates?"
- **Sector Analysis**: "Which economic sectors are growing fastest?"
- **Help & Guidance**: "What can you help me with?"

## 🔧 Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

## 📱 Responsive Design

The prototype is fully responsive and optimized for:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance
- ✅ **Keyboard Navigation** - Full keyboard accessibility
- ✅ **Screen Reader Support** - ARIA labels and semantic HTML
- ✅ **Color Contrast** - 4.5:1 minimum contrast ratios
- ✅ **Focus Management** - Clear focus indicators
- ✅ **Alternative Text** - Descriptive alt text for images
- ✅ **Language Support** - Bilingual EN/FR interface

### Additional Features
- High contrast mode toggle
- Font size adjustment options
- Animation reduction settings
- Skip navigation links
- Semantic HTML structure

## 🌐 Internationalization

The prototype supports:
- **English (EN)** - Default language
- **French (FR)** - Full translation support
- Dynamic language switching
- Localized date/time formats

## 📊 Mock Data & Simulations

This prototype includes:
- **Simulated AI responses** for different question types
- **Mock economic data** for charts and visualizations
- **Sample PDF documents** in the upload system
- **Generated reports** with realistic content
- **Interactive animations** and state changes

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar
│   └── Navbar.css      # Navigation styles
├── pages/              # Main application pages
│   ├── HomePage.tsx    # Landing page
│   ├── ChatPage.tsx    # AI chat interface
│   ├── DocumentUploadPage.tsx  # File upload
│   ├── ReportPage.tsx  # Report viewer
│   ├── SettingsPage.tsx # User preferences
│   └── *.css          # Page-specific styles
├── App.tsx            # Main application component
├── App.css            # Global styles
└── index.tsx          # Application entry point
```

## 🎨 Design System

### Color Palette
- **Primary**: #667eea (Indigo)
- **Secondary**: #10b981 (Emerald)
- **Accent**: #f59e0b (Amber)
- **Error**: #dc2626 (Red)
- **Success**: #065f46 (Green)

### Typography
- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- **Font Sizes**: Responsive scale from 0.875rem to 3.5rem
- **Line Height**: 1.6 for body text, 1.2 for headings

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **Traditional Web Servers**: Apache, Nginx
- **Cloud Platforms**: AWS S3, Azure Static Web Apps

## 📈 Future Enhancements

### Potential Improvements
1. **Real AI Integration** - Connect to actual LLM APIs
2. **Database Integration** - Real document storage and retrieval
3. **Advanced Analytics** - More sophisticated data analysis
4. **User Authentication** - Login system for city employees
5. **Real-time Collaboration** - Multi-user report editing
6. **Advanced Accessibility** - Voice commands, screen reader optimizations

### Technical Debt
- Add comprehensive unit tests
- Implement proper error boundary handling
- Add loading skeleton components
- Optimize bundle size with code splitting

## 📝 License

This project is developed as part of the City Studio Program partnership between the City of Ottawa and Algonquin College.

## 🤝 Contributing

This is a student-led prototype project. For questions or improvements:

1. Create issues for bug reports or feature requests
2. Follow accessibility best practices
3. Maintain bilingual support
4. Test on multiple devices and browsers

## 📞 Support

For technical support or questions about this prototype:
- Review the codebase documentation
- Check browser console for error messages
- Test with different browsers and devices
- Verify accessibility with screen readers

---

**Built with ❤️ for Ottawa's Economic Development Team**
