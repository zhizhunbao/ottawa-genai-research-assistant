import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from './app/App'
import './index.css'
import './i18n' // Initialize i18n

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
