import { createContext, useContext, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

// 导入页面组件
import Navbar from './components/Navbar';
import ChatPage from './pages/ChatPage';
import DocumentUploadPage from './pages/DocumentUploadPage';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import SettingsPage from './pages/SettingsPage';

// 语言上下文
interface LanguageContextType {
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'app.title': 'Ottawa GenAI Research Assistant',
    'nav.home': 'Home',
    'nav.chat': 'Chat',
    'nav.upload': 'Upload Documents',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'home.title': 'Ottawa Economic Development AI Assistant',
    'home.subtitle': 'Ask questions about economic development data and get intelligent insights with visualizations',
    'home.cta.start': 'Start Chatting',
    'home.cta.upload': 'Upload Documents',
    'features.qa.title': 'Natural Language Q&A',
    'features.qa.desc': 'Ask questions in English or French and get comprehensive answers',
    'features.analysis.title': 'Data Analysis',
    'features.analysis.desc': 'Automatic generation of charts and visualizations',
    'features.reports.title': 'Report Generation',
    'features.reports.desc': 'Create structured reports with summaries and conclusions',
    'features.accessibility.title': 'Accessibility Compliant',
    'features.accessibility.desc': 'WCAG 2.1 compliant with screen reader support'
  },
  fr: {
    'app.title': 'Assistant de Recherche GenAI d\'Ottawa',
    'nav.home': 'Accueil',
    'nav.chat': 'Chat',
    'nav.upload': 'Télécharger Documents',
    'nav.reports': 'Rapports',
    'nav.settings': 'Paramètres',
    'home.title': 'Assistant IA pour le Développement Économique d\'Ottawa',
    'home.subtitle': 'Posez des questions sur les données de développement économique et obtenez des insights intelligents avec visualisations',
    'home.cta.start': 'Commencer le Chat',
    'home.cta.upload': 'Télécharger Documents',
    'features.qa.title': 'Q&R en Langage Naturel',
    'features.qa.desc': 'Posez des questions en anglais ou français et obtenez des réponses complètes',
    'features.analysis.title': 'Analyse de Données',
    'features.analysis.desc': 'Génération automatique de graphiques et visualisations',
    'features.reports.title': 'Génération de Rapports',
    'features.reports.desc': 'Créez des rapports structurés avec résumés et conclusions',
    'features.accessibility.title': 'Conforme à l\'Accessibilité',
    'features.accessibility.desc': 'Conforme WCAG 2.1 avec support de lecteur d\'écran'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

function App() {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/upload" element={<DocumentUploadPage />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageContext.Provider>
  );
}

export default App;
