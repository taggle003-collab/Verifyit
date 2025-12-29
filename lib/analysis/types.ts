import { z } from 'zod'

export type HistoryWindow = '3months' | '6months' | '1year'
export type Confidence = 'low' | 'medium' | 'high'

export interface LeadData {
  name: string
  email: string
  title: string
  company: string
  location: string
  historyWindow: HistoryWindow
  profileLinks?: {
    linkedin?: string
    x?: string
    other?: string
  }
}

export interface PlatformSignals {
  platform: string
  activity_score: number
  hiring_signals: string[]
  growth_signals: string[]
  engagement_score: number
  recent_posts_count: number
  confidence: Confidence
  data_points: string[]
  timestamp: string
}

export interface AnalysisResult {
  verdict: 'pitch' | 'dont_pitch'
  overall_score: number
  confidence: Confidence
  confidence_percent: number
  reasons_for_pitching: string[]
  reasons_against_pitching: string[]
  company_profile: {
    name: string
    location: string
    industry: string
    estimated_employees: number | null
    recent_milestones: string[]
    primary_business: string
  }
  recommended_messaging: string[]
  scraped_signals: Record<string, PlatformSignals>
  breakdown: {
    company_growth: number
    social_activity: number
    job_title: number
    hiring_intent: number
    market_fit: number
  }
  created_at: string
}

export const leadDataSchema = z.object({
  name: z.string().min(1, 'Lead name is required'),
  email: z.string().email('Valid email is required'),
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().min(1, 'Location/Industry is required'),
  historyWindow: z.enum(['3months', '6months', '1year']),
  profileLinks: z
    .object({
      linkedin: z.string().url().optional().or(z.literal('')),
      x: z.string().url().optional().or(z.literal('')),
      other: z.string().url().optional().or(z.literal(''))
    })
    .optional()
})

export const verifyRequestSchema = z.object({
  lead: leadDataSchema,
  consent_scraping: z.literal(true),
  consent_deletion: z.literal(true)
})

export type VerifyRequest = z.infer<typeof verifyRequestSchema>
