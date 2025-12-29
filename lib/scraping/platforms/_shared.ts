import axios from 'axios'
import * as cheerio from 'cheerio'

export type FetchResult = {
  url: string
  html: string
}

export async function fetchHtml(url: string, timeoutMs = 15_000): Promise<FetchResult> {
  const res = await axios.get<string>(url, {
    timeout: timeoutMs,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    responseType: 'text',
    maxRedirects: 5,
    validateStatus: () => true
  })

  const html = typeof res.data === 'string' ? res.data : ''
  return { url, html }
}

export function extractKeywordSignals(text: string) {
  const t = text.toLowerCase()

  const hiring = [] as string[]
  const growth = [] as string[]

  if (/(we're hiring|we are hiring|hiring now|open roles|job openings|career(s)? page)/.test(t)) {
    hiring.push('Hiring language detected')
  }
  if (/(join us|come work with us)/.test(t)) hiring.push('"Join us" hiring call-to-action detected')

  if (/(funding|raised|series [a-f]|seed round|venture capital)/.test(t)) {
    growth.push('Funding/financing signals detected')
  }
  if (/(launch|released|new product|beta|general availability|ga)/.test(t)) {
    growth.push('Product launch/release signals detected')
  }
  if (/(partnership|partnered with|collaboration|integration)/.test(t)) {
    growth.push('Partnership/integration signals detected')
  }
  if (/(expanding|growth|scaling|new market|market expansion)/.test(t)) {
    growth.push('Expansion/growth language detected')
  }

  return { hiring, growth }
}

export function textFromHtml(html: string) {
  const $ = cheerio.load(html)
  return $('body').text().replace(/\s+/g, ' ').trim()
}

export function duckDuckGoHtmlSearchUrl(query: string) {
  return `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`
}

export function estimateEngagementScoreFromText(text: string) {
  const t = text.toLowerCase()
  let score = 0
  if (/(likes?|upvotes?)/.test(t)) score += 20
  if (/(comments?|repl(y|ies))/i.test(text)) score += 25
  if (/(retweet|repost|shares?)/.test(t)) score += 20
  if (/(views?|impressions)/.test(t)) score += 15
  return Math.max(0, Math.min(100, score))
}
