import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ConvexProvider } from "convex/react";
import { convexClient } from "./convexClient";
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convexClient}>
      <App />
    </ConvexProvider>
  </StrictMode>,
);
