import { NextResponse } from 'next/server'

import { getAnalysis } from '@/lib/session-store'
import { generateDocxBuffer } from '@/lib/docx-generator'

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

  const buffer = await generateDocxBuffer(item.analysis, {
    name: item.lead.name,
    title: item.lead.title,
    company: item.lead.company
  })

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="lead-verification-${id}.docx"`,
      'Cache-Control': 'no-store'
    }
  })
}
