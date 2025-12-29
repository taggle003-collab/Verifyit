import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from 'docx'

import type { AnalysisResult } from '@/lib/analysis/types'

export async function generateDocxBuffer(
  analysis: AnalysisResult,
  lead: { name: string; title: string; company: string }
) {
  const taggleUrl = process.env.NEXT_PUBLIC_TAGGLE_URL || 'https://taggle.ai'

  const verdictText = analysis.verdict === 'pitch' ? 'Pitch This Lead' : 'Not Ready to Pitch'

  const breakdownRows: Array<[string, number]> = [
    ['Company Growth', analysis.breakdown.company_growth],
    ['Recent Social Activity', analysis.breakdown.social_activity],
    ['Job Title / Seniority', analysis.breakdown.job_title],
    ['Hiring Intent', analysis.breakdown.hiring_intent],
    ['Industry / Market Fit', analysis.breakdown.market_fit]
  ]

  const breakdownTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Category', bold: true })]
              })
            ]
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Score (0-100)', bold: true })]
              })
            ]
          })
        ]
      }),
      ...breakdownRows.map(
        ([k, v]) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(k)] }),
              new TableCell({ children: [new Paragraph(String(v))] })
            ]
          })
      )
    ]
  })

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'Taggle — Lead Verification Report',
            heading: HeadingLevel.HEADING_1
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated: ${new Date(analysis.created_at).toLocaleString()}`,
                color: '6b7280'
              })
            ]
          }),
          new Paragraph(''),

          new Paragraph({ text: `Lead: ${lead.name}` }),
          new Paragraph({ text: `Title: ${lead.title}` }),
          new Paragraph({ text: `Company: ${lead.company}` }),
          new Paragraph(''),

          new Paragraph({
            text: `Verdict: ${verdictText}`,
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({ text: `Overall Score: ${analysis.overall_score}/100` }),
          new Paragraph({ text: `Confidence: ${analysis.confidence} (${analysis.confidence_percent}%)` }),
          new Paragraph(''),

          new Paragraph({ text: 'Score Breakdown', heading: HeadingLevel.HEADING_2 }),
          breakdownTable,
          new Paragraph(''),

          new Paragraph({ text: 'Reasons For Pitching', heading: HeadingLevel.HEADING_2 }),
          ...analysis.reasons_for_pitching.map((r) => new Paragraph({ text: `• ${r}` })),
          new Paragraph(''),

          new Paragraph({ text: 'Reasons Against Pitching', heading: HeadingLevel.HEADING_2 }),
          ...analysis.reasons_against_pitching.map((r) => new Paragraph({ text: `• ${r}` })),
          new Paragraph(''),

          new Paragraph({ text: 'Company Profile', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: `Name: ${analysis.company_profile.name}` }),
          new Paragraph({ text: `Location/Industry: ${analysis.company_profile.location}` }),
          new Paragraph({
            text: `Estimated Employees: ${analysis.company_profile.estimated_employees ?? 'Unknown'}`
          }),
          new Paragraph({ text: `Primary Business: ${analysis.company_profile.primary_business}` }),
          new Paragraph({ text: 'Recent Milestones:' }),
          ...analysis.company_profile.recent_milestones.slice(0, 5).map((m) => new Paragraph({ text: `• ${m}` })),
          new Paragraph(''),

          new Paragraph({ text: 'Recommended Messaging Angles', heading: HeadingLevel.HEADING_2 }),
          ...analysis.recommended_messaging.map((m) => new Paragraph({ text: `• ${m}` })),

          new Paragraph(''),
          new Paragraph({
            children: [
              new TextRun({ text: 'Built by Taggle — ', color: '6b7280' }),
              new TextRun({ text: taggleUrl, color: '2563eb' })
            ]
          })
        ]
      }
    ]
  })

  return Packer.toBuffer(doc)
}
