type AnalyticsEvent =
  | { name: 'event_detail_view'; data: { slug: string; title: string } }
  | { name: 'add_to_calendar_click'; data: { provider: 'google' | 'apple'; event_slug: string } }
  | { name: 'email_signup_submit'; data?: Record<string, never> }
  | { name: 'flyer_archive_view'; data?: Record<string, never> }
  | { name: 'unsubscribe_complete'; data?: Record<string, never> }
  | { name: 'instructor_profile_view'; data: { slug: string } }

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) return

  // Umami exposes window.umami after the script loads
  const umami = (window as unknown as { umami?: { track: (name: string, data?: unknown) => void } }).umami
  umami?.track(event.name, event.data)
}
