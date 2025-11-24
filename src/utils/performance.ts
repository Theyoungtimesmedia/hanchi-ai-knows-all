import { analytics } from './analytics';

export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startTimer(label: string) {
    this.metrics.set(label, performance.now());
  }

  endTimer(label: string) {
    const startTime = this.metrics.get(label);
    if (!startTime) {
      console.warn(`Timer not found: ${label}`);
      return;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(label);

    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    analytics.trackPerformance(label, duration);

    return duration;
  }

  measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    return fn().finally(() => this.endTimer(label));
  }

  logWebVitals() {
    // Core Web Vitals
    if ('web-vital' in performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('[Web Vitals]', entry.name, entry);
          analytics.trackPerformance(`web_vital_${entry.name}`, entry.duration || 0);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
