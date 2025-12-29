import PDFDocument from 'pdfkit'

import type { AnalysisResult } from '@/lib/analysis/types'

function streamToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (d) => chunks.push(Buffer.isBuffer(d) ? d : Buffer.from(d)))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })
}

export async function generatePdfBuffer(analysis: AnalysisResult, lead: { name: string; title: string; company: string }) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })

  const bufferPromise = streamToBuffer(doc)

  const taggleUrl = process.env.NEXT_PUBLIC_TAGGLE_URL || 'https://taggle.ai'
  const verdictColor = analysis.verdict === 'pitch' ? '#16a34a' : '#dc2626'

  doc.fontSize(20).fillColor('#111827').text('Taggle — Lead Verification Report', { align: 'left' })
  doc.moveDown(0.5)
  doc.fontSize(10).fillColor('#6b7280').text(`Generated: ${new Date(analysis.created_at).toLocaleString()}`)

  doc.moveDown(1)

  doc.fontSize(12).fillColor('#111827').text(`Lead: ${lead.name}`)
  doc.text(`Title: ${lead.title}`)
  doc.text(`Company: ${lead.company}`)

  doc.moveDown(1)

  // Verdict banner
  const bannerTop = doc.y
  doc.save()
  doc.rect(doc.page.margins.left, bannerTop, doc.page.width - doc.page.margins.left - doc.page.margins.right, 40).fill(verdictColor)
  doc.fillColor('white').fontSize(16).text(
    analysis.verdict === 'pitch' ? 'Pitch This Lead' : 'Not Ready to Pitch',
    doc.page.margins.left + 12,
    bannerTop + 12
  )
  doc.restore()

  doc.moveDown(3)

  doc.fontSize(14).fillColor('#111827').text(`Overall Score: ${analysis.overall_score}/100`)
  doc.fontSize(11).fillColor('#6b7280').text(`Confidence: ${analysis.confidence} (${analysis.confidence_percent}%)`)

  doc.moveDown(1)

  doc.fontSize(13).fillColor('#111827').text('Score Breakdown')
  doc.moveDown(0.25)

  const rows: Array<[string, number]> = [
    ['Company Growth', analysis.breakdown.company_growth],
    ['Recent Social Activity', analysis.breakdown.social_activity],
    ['Job Title / Seniority', analysis.breakdown.job_title],
    ['Hiring Intent', analysis.breakdown.hiring_intent],
    ['Industry / Market Fit', analysis.breakdown.market_fit]
  ]

  rows.forEach(([label, value]) => {
    doc.fontSize(11).fillColor('#111827').text(`${label}: ${value}/100`)
  })

  doc.moveDown(1)

  doc.fontSize(13).fillColor('#111827').text('Reasons For Pitching')
  doc.moveDown(0.25)
  analysis.reasons_for_pitching.forEach((r) => {
    doc.fontSize(11).fillColor('#111827').text(`• ${r}`)
  })

  doc.moveDown(0.75)

  doc.fontSize(13).fillColor('#111827').text('Reasons Against Pitching')
  doc.moveDown(0.25)
  analysis.reasons_against_pitching.forEach((r) => {
    doc.fontSize(11).fillColor('#111827').text(`• ${r}`)
  })

  doc.moveDown(0.75)

  doc.fontSize(13).fillColor('#111827').text('Company Profile')
  doc.moveDown(0.25)
  doc.fontSize(11).fillColor('#111827').text(`Name: ${analysis.company_profile.name}`)
  doc.text(`Location/Industry: ${analysis.company_profile.location}`)
  doc.text(`Estimated Employees: ${analysis.company_profile.estimated_employees ?? 'Unknown'}`)
  doc.text(`Primary Business: ${analysis.company_profile.primary_business}`)
  doc.moveDown(0.25)
  doc.text('Recent Milestones:')
  analysis.company_profile.recent_milestones.slice(0, 5).forEach((m) => {
    doc.text(`• ${m}`)
  })

  doc.moveDown(0.75)

  doc.fontSize(13).fillColor('#111827').text('Recommended Messaging Angles')
  doc.moveDown(0.25)
  analysis.recommended_messaging.forEach((m) => {
    doc.fontSize(11).fillColor('#111827').text(`• ${m}`)
  })

  doc.moveDown(1)
  doc.fontSize(10).fillColor('#6b7280').text(`Built by Taggle — ${taggleUrl}`, { align: 'left' })

  doc.end()

  return bufferPromise
}
