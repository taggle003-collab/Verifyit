import { NextResponse } from 'next/server'

import { getAnalysis } from '@/lib/session-store'
import { generatePdfBuffer } from '@/lib/pdf-generator'

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

  const buffer = await generatePdfBuffer(item.analysis, {
    name: item.lead.name,
    title: item.lead.title,
    company: item.lead.company
  })

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="lead-verification-${id}.pdf"`,
      'Cache-Control': 'no-store'
    }
  })
}
