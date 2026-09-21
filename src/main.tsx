import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { RealtimeProvider } from './context/RealtimeContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <RealtimeProvider>
        <App />
      </RealtimeProvider>
    </LanguageProvider>
  </StrictMode>,
);

