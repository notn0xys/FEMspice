import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import App from './App.tsx'
import React from 'react';
import { WireModeProvider } from '@/context/wire-mode-context';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <WireModeProvider>
          <App />
        </WireModeProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
