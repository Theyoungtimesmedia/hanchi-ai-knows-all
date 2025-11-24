import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from "./App.tsx";
import "./index.css";
import { initializePlugins } from './plugins';
import { performanceMonitor } from './utils/performance';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient();

// Initialize plugins
initializePlugins();

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
}

// Monitor performance
performanceMonitor.logWebVitals();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);
