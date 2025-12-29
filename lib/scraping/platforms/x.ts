import type { LeadData, PlatformSignals } from '@/lib/analysis/types'
import {
  duckDuckGoHtmlSearchUrl,
  estimateEngagementScoreFromText,
  extractKeywordSignals,
  fetchHtml,
  textFromHtml
} from '@/lib/scraping/platforms/_shared'

export async function scrapeX(lead: LeadData): Promise<PlatformSignals> {
  // Best-effort: use public search index (DuckDuckGo HTML) to avoid JS-heavy pages.
  const query = `site:x.com ${lead.name} ${lead.company}`
  const url = duckDuckGoHtmlSearchUrl(query)
  const { html } = await fetchHtml(url, 15_000)

  const text = textFromHtml(html)
  const { hiring, growth } = extractKeywordSignals(text)

  // Heuristic: number of search results links approximates "recent" activity.
  const resultLinks = (html.match(/result__a/g) ?? []).length
  const recentPosts = Math.min(25, resultLinks)

  return {
    platform: 'x',
    activity_score: Math.max(0, Math.min(100, recentPosts * 6)),
    hiring_signals: hiring,
    growth_signals: growth,
    engagement_score: estimateEngagementScoreFromText(text),
    recent_posts_count: recentPosts,
    confidence: recentPosts > 0 ? 'medium' : 'low',
    data_points: recentPosts > 0 ? ['Public search results indicate presence on X (best-effort).'] : ['No public X signals found.'],
    timestamp: new Date().toISOString()
  }
}
