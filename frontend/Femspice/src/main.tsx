import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import App from './App.tsx'
import React  from 'react';
import { WireModeProvider } from '@/context/wire-mode-context';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>

    <BrowserRouter>
      <WireModeProvider>
        <App />
      </WireModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
