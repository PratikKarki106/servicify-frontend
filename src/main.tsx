import './index.css';
import App from './App.tsx';
import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'; // use createRoot directly
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Get root element
const root = document.getElementById("root") as HTMLElement;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
