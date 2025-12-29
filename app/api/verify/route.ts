import { NextResponse } from 'next/server'

import { verifyRequestSchema } from '@/lib/analysis/types'
import { analyzeLead } from '@/lib/analysis/scorer'
import { scrapeAllPlatforms } from '@/lib/scraping/scraper'
import { createAnalysis } from '@/lib/session-store'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = verifyRequestSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const lead = {
      ...parsed.data.lead,
      profileLinks: {
        linkedin: parsed.data.lead.profileLinks?.linkedin || undefined,
        x: parsed.data.lead.profileLinks?.x || undefined,
        other: parsed.data.lead.profileLinks?.other || undefined
      }
    }

    const scraped = await scrapeAllPlatforms(lead, { timeoutMs: 60_000 })
    const analysis = analyzeLead(lead, scraped)

    const { id, expiresAt } = createAnalysis({ lead, analysis })

    return NextResponse.json({
      analysis_id: id,
      expires_at: new Date(expiresAt).toISOString(),
      analysis
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Verification failed', message }, { status: 500 })
  }
}
