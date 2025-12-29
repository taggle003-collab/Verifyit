import { LeadData, AnalysisResult } from './analysis/types'

export function generateMockAnalysis(leadData: LeadData): AnalysisResult {
  const scoreRange = Math.floor(Math.random() * 40) + 50 // 50-90
  const verdict = scoreRange >= 65 ? 'pitch' : 'dont_pitch'
  
  const industries = ['SaaS', 'Fintech', 'Healthtech', 'E-commerce', 'AI/ML', 'Cybersecurity']
  const selectedIndustry = industries[Math.floor(Math.random() * industries.length)]

  return {
    verdict,
    overall_score: scoreRange,
    confidence: 'high',
    confidence_percent: 92,
    reasons_for_pitching: [
      'Recently active on LinkedIn with company updates',
      'Decision maker in a relevant target role',
      'Company is actively hiring in key departments',
      'Strong social media engagement and presence',
      'Growth industry with expansion signals'
    ],
    reasons_against_pitching: verdict === 'dont_pitch' ? [
      'Limited recent public activity',
      'No clear hiring signals in the last 3 months',
      'Market segment currently facing headwinds'
    ] : [],
    company_profile: {
      name: leadData.company,
      location: leadData.location,
      industry: selectedIndustry,
      estimated_employees: Math.floor(Math.random() * 500) + 50,
      recent_milestones: [
        'Series B funding announced',
        'Expanded to new markets',
        'Launched new product line'
      ],
      primary_business: `${selectedIndustry} solutions for enterprise clients`
    },
    recommended_messaging: [
      `Reference ${leadData.company}'s recent growth initiatives`,
      `Mention alignment with their hiring in ${leadData.title} roles`,
      'Discuss industry expansion opportunities'
    ],
    scraped_signals: {
      linkedin: {
        platform: 'LinkedIn',
        activity_score: 85,
        hiring_signals: ['Engineering Manager', 'Account Executive'],
        growth_signals: ['New office in London', '15% headcount growth'],
        engagement_score: 75,
        recent_posts_count: 12,
        confidence: 'high',
        data_points: ['Posted 2 days ago', 'Hiring for 5 roles'],
        timestamp: new Date().toISOString()
      },
      x: {
        platform: 'X',
        activity_score: 45,
        hiring_signals: [],
        growth_signals: [],
        engagement_score: 30,
        recent_posts_count: 2,
        confidence: 'medium',
        data_points: ['Last posted 2 weeks ago'],
        timestamp: new Date().toISOString()
      }
    },
    breakdown: {
      company_growth: 80,
      social_activity: 70,
      job_title: 90,
      hiring_intent: 65,
      market_fit: 85
    },
    created_at: new Date().toISOString()
  }
}
