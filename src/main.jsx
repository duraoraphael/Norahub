import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './pwa.css'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import RecaptchaLoader from './components/RecaptchaLoader'

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {/* reCAPTCHA Loader envolvendo a aplicação */}
      <RecaptchaLoader>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </RecaptchaLoader>
    </React.StrictMode>
  );
}