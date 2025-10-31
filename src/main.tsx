import './index.css';
import App from './App.tsx';
import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'; // use createRoot directly
import React from 'react';

// Get root element
const root = document.getElementById("root") as HTMLElement;

createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
