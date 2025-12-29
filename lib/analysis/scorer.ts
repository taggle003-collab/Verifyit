import type { LeadData, AnalysisResult, PlatformSignals, Confidence } from '@/lib/analysis/types'

function clamp0to100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

function windowDays(window: LeadData['historyWindow']): number {
  switch (window) {
    case '3months':
      return 90
    case '6months':
      return 180
    case '1year':
      return 365
  }
}

function scoreJobTitle(titleRaw: string) {
  const title = titleRaw.toLowerCase()

  const cSuite = ['ceo', 'cto', 'cfo', 'coo', 'cmo', 'chief']
  const vpDirector = ['vp', 'vice president', 'director', 'head of']
  const managerLead = ['manager', 'lead', 'team lead', 'engineering lead', 'product lead']

  if (cSuite.some((t) => title.includes(t))) return 100
  if (vpDirector.some((t) => title.includes(t))) return 75
  if (managerLead.some((t) => title.includes(t))) return 50
  if (title.trim().length === 0) return 40
  return 25
}

function scoreCompanyGrowth(signals: PlatformSignals[]) {
  const text = signals.flatMap((s) => [...s.growth_signals, ...s.data_points]).join(' | ').toLowerCase()

  let score = 0
  if (/(funding|series [a-f]|seed round|raised \$|venture)/.test(text)) score += 60
  if (/(launch|released|new product|beta|general availability|ga)/.test(text)) score += 48
  if (/(hiring|we're hiring|join us|open roles|team is growing|expanding)/.test(text)) score += 72
  if (/(revenue|arr|grew|growth|record quarter)/.test(text)) score += 60
  if (/(partnership|partnered with|collaboration|integration)/.test(text)) score += 40

  return clamp0to100(score)
}

function scoreRecentSocialActivity(signals: PlatformSignals[], window: LeadData['historyWindow']) {
  const days = windowDays(window)

  const recentPosts = signals.reduce((acc, s) => acc + (s.recent_posts_count || 0), 0)
  const avgEngagement =
    signals.length > 0
      ? signals.reduce((acc, s) => acc + (s.engagement_score || 0), 0) / signals.length
      : 0

  const postsScore = clamp0to100((recentPosts / Math.max(1, days / 30)) * 20) // ~20 per "month" in window
  const engagementScore = clamp0to100(avgEngagement)

  // follower growth is usually not directly available — use activity as proxy
  const followerGrowthProxy = clamp0to100(postsScore * 0.75)

  return clamp0to100(postsScore * 0.4 + engagementScore * 0.4 + followerGrowthProxy * 0.2)
}

function scoreHiringIntent(signals: PlatformSignals[]) {
  const hiringMentions = signals.flatMap((s) => s.hiring_signals).join(' | ').toLowerCase()
  const points = signals.flatMap((s) => [...s.hiring_signals, ...s.data_points]).join(' | ').toLowerCase()

  let score = 0
  if (/(we're hiring|we are hiring|hiring)/.test(hiringMentions)) score += 90
  if (/(join us)/.test(hiringMentions)) score += 75
  if (/(careers|open roles|job openings|apply now)/.test(points)) score += 60
  if (/(multiple roles|several roles|many openings)/.test(points)) score += 75
  if (/(lever\.co|greenhouse\.io|workable\.com|ashbyhq\.com|smartrecruiters\.com)/.test(points)) score += 50

  return clamp0to100(score)
}

function scoreMarketFit(signals: PlatformSignals[], lead: LeadData) {
  const haystack = `${lead.location} ${signals
    .flatMap((s) => [...s.growth_signals, ...s.hiring_signals, ...s.data_points])
    .join(' ')}`.toLowerCase()

  let score = 0
  if (/(cloud|aws|gcp|azure|kubernetes|devops)/.test(haystack)) score += 60
  if (/(ai|ml|machine learning|automation|agents)/.test(haystack)) score += 60
  if (/(expanding|international|new market|market expansion)/.test(haystack)) score += 40
  if (/(r&d|research|innovation|new initiative)/.test(haystack)) score += 50
  if (/(saas|platform|api|b2b)/.test(haystack)) score += 35

  return clamp0to100(score)
}

function calculateConfidence(signalsByPlatform: Record<string, PlatformSignals>): {
  confidence: Confidence
  confidencePercent: number
} {
  const platformsWithData = Object.values(signalsByPlatform).filter((s) => (s.recent_posts_count ?? 0) > 0 || s.data_points.length > 0)

  const platformCount = platformsWithData.length
  const scores = platformsWithData.map((s) => s.activity_score)
  const variance =
    scores.length <= 1
      ? 100
      : Math.max(...scores) - Math.min(...scores)

  if (platformCount >= 4 && variance < 15) return { confidence: 'high', confidencePercent: 85 }
  if (platformCount >= 2 && platformCount <= 3 && variance >= 15 && variance <= 30)
    return { confidence: 'medium', confidencePercent: 65 }
  if (platformCount >= 2) return { confidence: 'medium', confidencePercent: 55 }
  return { confidence: 'low', confidencePercent: 35 }
}

function pickTop(items: string[], n: number) {
  const unique = Array.from(new Set(items.map((s) => s.trim()).filter(Boolean)))
  return unique.slice(0, n)
}

export function analyzeLead(lead: LeadData, signalsByPlatform: Record<string, PlatformSignals>): AnalysisResult {
  const signals = Object.values(signalsByPlatform)

  const companyGrowth = scoreCompanyGrowth(signals)
  const social = scoreRecentSocialActivity(signals, lead.historyWindow)
  const title = scoreJobTitle(lead.title)
  const hiring = scoreHiringIntent(signals)
  const fit = scoreMarketFit(signals, lead)

  const weighted =
    companyGrowth * 0.25 +
    social * 0.2 +
    title * 0.2 +
    hiring * 0.2 +
    fit * 0.15

  const overall = clamp0to100(weighted)
  const verdict: AnalysisResult['verdict'] = overall >= 65 ? 'pitch' : 'dont_pitch'

  const { confidence, confidencePercent } = calculateConfidence(signalsByPlatform)

  const forPitch: string[] = []
  const against: string[] = []

  if (companyGrowth >= 60) forPitch.push('Strong company growth signals detected (funding, launches, partnerships, or expansion).')
  if (hiring >= 60) forPitch.push('Hiring intent indicators found (hiring language, careers pages, or job board activity).')
  if (social >= 60) forPitch.push('Active recent social presence with meaningful engagement signals.')
  if (title >= 75) forPitch.push('Seniority suggests buying influence (VP/Director/C-suite).')
  if (fit >= 55) forPitch.push('Market/tech-fit signals found (cloud, AI, automation, SaaS, innovation).')

  if (companyGrowth < 40) against.push('Limited publicly visible growth signals (funding/launch/partnership cues were weak or missing).')
  if (hiring < 40) against.push('Hiring intent not clearly visible in the selected time window.')
  if (social < 35) against.push('Low recent social activity; may be inactive or hard to validate publicly.')
  if (title <= 25) against.push('Title suggests limited purchasing authority (or ambiguous seniority).')
  if (fit < 35) against.push('Insufficient market/tech-fit evidence from public signals.')

  const milestones = pickTop(
    signals.flatMap((s) => s.growth_signals).concat(signals.flatMap((s) => s.hiring_signals)),
    5
  )

  const recommended = pickTop(
    [
      milestones.some((m) => /funding|raised|series/i.test(m))
        ? `Congrats on the recent momentum — curious how you're prioritizing initiatives after the funding/news at ${lead.company}?`
        : '',
      milestones.some((m) => /hiring|join/i.test(m))
        ? `Noticed the team is growing — where are the biggest process bottlenecks as you scale hiring at ${lead.company}?`
        : '',
      `Quick question: what does success look like for your team this quarter at ${lead.company} (especially around ${lead.location})?`
    ].filter(Boolean),
    3
  )

  const companyProfileIndustry = lead.location
  const primaryBusiness = `Public signals suggest ${lead.company} is active in ${companyProfileIndustry}.`

  const reasonsFor = pickTop(forPitch, 5)
  const reasonsAgainst = pickTop(against, 5)

  while (reasonsFor.length < 3) {
    reasonsFor.push('Some positive indicators exist, but public signals are limited — use a light-touch, value-led opener.')
  }
  while (reasonsAgainst.length < 3) {
    reasonsAgainst.push('Limited public data available across platforms in the selected window; confidence is reduced.')
  }

  return {
    verdict,
    overall_score: overall,
    confidence,
    confidence_percent: confidencePercent,
    reasons_for_pitching: pickTop(reasonsFor, 5),
    reasons_against_pitching: pickTop(reasonsAgainst, 5),
    company_profile: {
      name: lead.company,
      location: lead.location,
      industry: companyProfileIndustry,
      estimated_employees: null,
      recent_milestones: milestones.length ? milestones : ['No specific milestones detected in the selected window.'],
      primary_business: primaryBusiness
    },
    recommended_messaging: recommended,
    scraped_signals: signalsByPlatform,
    breakdown: {
      company_growth: companyGrowth,
      social_activity: social,
      job_title: title,
      hiring_intent: hiring,
      market_fit: fit
    },
    created_at: new Date().toISOString()
  }
}
