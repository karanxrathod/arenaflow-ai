import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { ProfileProvider } from './context/ProfileContext.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
);
