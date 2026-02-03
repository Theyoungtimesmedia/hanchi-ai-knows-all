import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import App from "./App";
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

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
