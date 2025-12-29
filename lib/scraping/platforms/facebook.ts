import type { LeadData, PlatformSignals } from '@/lib/analysis/types'
import {
  duckDuckGoHtmlSearchUrl,
  estimateEngagementScoreFromText,
  extractKeywordSignals,
  fetchHtml,
  textFromHtml
} from '@/lib/scraping/platforms/_shared'

export async function scrapeFacebook(lead: LeadData): Promise<PlatformSignals> {
  const query = `site:facebook.com ${lead.name} ${lead.company}`
  const url = duckDuckGoHtmlSearchUrl(query)
  const { html } = await fetchHtml(url, 15_000)

  const text = textFromHtml(html)
  const { hiring, growth } = extractKeywordSignals(text)
  const resultLinks = (html.match(/result__a/g) ?? []).length
  const recentPosts = Math.min(20, resultLinks)

  return {
    platform: 'facebook',
    activity_score: Math.max(0, Math.min(100, recentPosts * 4)),
    hiring_signals: hiring,
    growth_signals: growth,
    engagement_score: estimateEngagementScoreFromText(text),
    recent_posts_count: recentPosts,
    confidence: recentPosts > 0 ? 'medium' : 'low',
    data_points:
      recentPosts > 0
        ? ['Public search results indicate presence on Facebook (best-effort).']
        : ['No public Facebook signals found.'],
    timestamp: new Date().toISOString()
  }
}
