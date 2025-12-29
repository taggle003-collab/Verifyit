import { NextResponse } from 'next/server'

import { deleteAnalysis, getAnalysis } from '@/lib/session-store'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const item = getAnalysis(id)
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({
    analysis_id: item.id,
    lead: item.lead,
    analysis: item.analysis,
    expires_at: new Date(item.expiresAt).toISOString()
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  deleteAnalysis(id)
  return NextResponse.json({ success: true })
}
