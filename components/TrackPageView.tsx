'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

type AnalyticsEvent = Parameters<typeof trackEvent>[0]

export function TrackPageView({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    trackEvent(event)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
