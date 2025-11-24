interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        userId: this.userId,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    this.events.push(analyticsEvent);
    console.log('[Analytics]', event, properties);

    // In production, send to analytics service
    this.flush();
  }

  private flush() {
    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  // Track specific events
  trackPageView(page: string) {
    this.track('page_view', { page });
  }

  trackChatMessage(messageType: 'user' | 'assistant', messageLength: number) {
    this.track('chat_message', { messageType, messageLength });
  }

  trackFeatureUse(feature: string, action: string) {
    this.track('feature_use', { feature, action });
  }

  trackError(error: string, context?: Record<string, any>) {
    this.track('error', { error, ...context });
  }

  trackPerformance(metric: string, value: number) {
    this.track('performance', { metric, value });
  }

  getEvents() {
    return this.events;
  }
}

export const analytics = new AnalyticsService();
