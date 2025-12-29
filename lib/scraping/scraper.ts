import type { LeadData, PlatformSignals } from '@/lib/analysis/types'

import { scrapeX } from '@/lib/scraping/platforms/x'
import { scrapeReddit } from '@/lib/scraping/platforms/reddit'
import { scrapeInstagram } from '@/lib/scraping/platforms/instagram'
import { scrapeLinkedIn } from '@/lib/scraping/platforms/linkedin'
import { scrapeFacebook } from '@/lib/scraping/platforms/facebook'

export type ScrapeCoordinatorOptions = {
  timeoutMs?: number
}

const MIN_INTERVAL_MS = 2000
const lastRequestByPlatform = new Map<string, number>()

async function rateLimit(platform: string) {
  const last = lastRequestByPlatform.get(platform) ?? 0
  const delta = Date.now() - last
  if (delta < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - delta))
  }
  lastRequestByPlatform.set(platform, Date.now())
}

async function withTimeout<T>(p: Promise<T>, timeoutMs: number, platform: string): Promise<T> {
  let t: NodeJS.Timeout | undefined
  const timeout = new Promise<T>((_, reject) => {
    t = setTimeout(() => reject(new Error(`${platform} scrape timeout`)), timeoutMs)
  })
  try {
    return await Promise.race([p, timeout])
  } finally {
    if (t) clearTimeout(t)
  }
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3) {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      await new Promise((r) => setTimeout(r, 350 * (i + 1)))
    }
  }
  throw lastErr
}

function emptySignals(platform: string): PlatformSignals {
  return {
    platform,
    activity_score: 0,
    hiring_signals: [],
    growth_signals: [],
    engagement_score: 0,
    recent_posts_count: 0,
    confidence: 'low',
    data_points: [],
    timestamp: new Date().toISOString()
  }
}

export async function scrapeAllPlatforms(
  lead: LeadData,
  opts: ScrapeCoordinatorOptions = {}
): Promise<Record<string, PlatformSignals>> {
  const timeoutMs = opts.timeoutMs ?? 60_000

  const tasks: Array<Promise<[string, PlatformSignals]>> = [
    (async () => {
      const platform = 'x'
      try {
        await rateLimit(platform)
        const result = await withTimeout(withRetry(() => scrapeX(lead)), timeoutMs, platform)
        return [platform, result]
      } catch {
        return [platform, emptySignals(platform)]
      }
    })(),
    (async () => {
      const platform = 'reddit'
      try {
        await rateLimit(platform)
        const result = await withTimeout(withRetry(() => scrapeReddit(lead)), timeoutMs, platform)
        return [platform, result]
      } catch {
        return [platform, emptySignals(platform)]
      }
    })(),
    (async () => {
      const platform = 'instagram'
      try {
        await rateLimit(platform)
        const result = await withTimeout(withRetry(() => scrapeInstagram(lead)), timeoutMs, platform)
        return [platform, result]
      } catch {
        return [platform, emptySignals(platform)]
      }
    })(),
    (async () => {
      const platform = 'linkedin'
      try {
        await rateLimit(platform)
        const result = await withTimeout(withRetry(() => scrapeLinkedIn(lead)), timeoutMs, platform)
        return [platform, result]
      } catch {
        return [platform, emptySignals(platform)]
      }
    })(),
    (async () => {
      const platform = 'facebook'
      try {
        await rateLimit(platform)
        const result = await withTimeout(withRetry(() => scrapeFacebook(lead)), timeoutMs, platform)
        return [platform, result]
      } catch {
        return [platform, emptySignals(platform)]
      }
    })()
  ]

  const entries = await Promise.all(tasks)
  return Object.fromEntries(entries)
}
