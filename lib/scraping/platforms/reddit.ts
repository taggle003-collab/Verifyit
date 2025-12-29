import axios from 'axios'

import type { LeadData, PlatformSignals } from '@/lib/analysis/types'
import { extractKeywordSignals } from '@/lib/scraping/platforms/_shared'

interface RedditPostData {
  created_utc: number
  title: string
  selftext: string
  score: number
  num_comments: number
  subreddit: string
}

interface RedditChild {
  data: RedditPostData
}

interface RedditResponse {
  data: {
    children: RedditChild[]
  }
}

function historyCutoffUnixSeconds(window: LeadData['historyWindow']) {
  const now = Date.now()
  const days = window === '3months' ? 90 : window === '6months' ? 180 : 365
  return Math.floor((now - days * 24 * 60 * 60 * 1000) / 1000)
}

export async function scrapeReddit(lead: LeadData): Promise<PlatformSignals> {
  const q = `${lead.name} ${lead.company}`
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&limit=25&sort=new`

  const res = await axios.get<RedditResponse>(url, {
    timeout: 15_000,
    headers: {
      'User-Agent': 'verifyit/1.0 (lead verification tool)'
    },
    validateStatus: () => true
  })

  if (res.status !== 200 || !res.data) {
    return {
      platform: 'reddit',
      activity_score: 0,
      hiring_signals: [],
      growth_signals: [],
      engagement_score: 0,
      recent_posts_count: 0,
      confidence: 'low',
      data_points: ['Reddit search unavailable or blocked'],
      timestamp: new Date().toISOString()
    }
  }

  const cutoff = historyCutoffUnixSeconds(lead.historyWindow)
  const posts = (res.data?.data?.children ?? [])
    .map((c: RedditChild) => c?.data)
    .filter(Boolean)
    .filter((p: RedditPostData) => (p.created_utc ?? 0) >= cutoff)

  const texts = posts
    .map((p: RedditPostData) => `${p.title ?? ''} ${p.selftext ?? ''}`.trim())
    .filter(Boolean)

  const combinedText = texts.join(' | ')
  const { hiring, growth } = extractKeywordSignals(combinedText)

  const engagement = posts.reduce((acc: number, p: RedditPostData) => {
    const score = Number(p.score ?? 0)
    const comments = Number(p.num_comments ?? 0)
    return acc + Math.min(100, score * 0.3 + comments * 2)
  }, 0)

  const engagementScore = posts.length ? Math.round(engagement / posts.length) : 0

  const recentCount = posts.length
  const activityScore = Math.max(0, Math.min(100, recentCount * 8))

  return {
    platform: 'reddit',
    activity_score: activityScore,
    hiring_signals: hiring,
    growth_signals: growth,
    engagement_score: Math.max(0, Math.min(100, engagementScore)),
    recent_posts_count: recentCount,
    confidence: recentCount > 0 ? 'high' : 'low',
    data_points: posts.slice(0, 5).map((p: RedditPostData) => `r/${p.subreddit}: ${p.title}`),
    timestamp: new Date().toISOString()
  }
}
