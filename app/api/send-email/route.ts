import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'

import { getAnalysis } from '@/lib/session-store'
import { generatePdfBuffer } from '@/lib/pdf-generator'

export const runtime = 'nodejs'

const schema = z.object({
  analysis_id: z.string().min(1),
  email_address: z.string().email(),
  recipient_name: z.string().min(1).optional()
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      console.log("🎯 DEMO MODE: Email sending is in demo mode");
      return NextResponse.json({
        success: true,
        message: "Demo Mode: Report would be sent to your email. Configure SendGrid in environment variables for real email delivery.",
        token: `demo-${Date.now()}`,
        demoMode: true
      });
    }

    const item = getAnalysis(parsed.data.analysis_id)
    if (!item) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    const pdf = await generatePdfBuffer(item.analysis, {
      name: item.lead.name,
      title: item.lead.title,
      company: item.lead.company
    })

    const token = randomUUID()

    sgMail.setApiKey(apiKey)

    const taggleUrl = process.env.NEXT_PUBLIC_TAGGLE_URL || 'https://taggle.ai'
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@taggle.ai'

    const subject = `Lead Verification Report — ${item.lead.company}`

    const recipientName = parsed.data.recipient_name || 'there'

    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.5;">
        <h2 style="margin:0 0 8px 0;">Taggle — Lead Verification Report</h2>
        <p style="margin:0 0 16px 0;">Hi ${recipientName},</p>
        <p style="margin:0 0 16px 0;">Attached is your lead verification report for <strong>${item.lead.name}</strong> at <strong>${item.lead.company}</strong>.</p>
        <p style="margin:0 0 16px 0;">This report is generated using best-effort real-time public signals and is automatically deleted within 24 hours.</p>
        <p style="margin:0;">Built by <a href="${taggleUrl}">Taggle</a>.</p>
        <hr style="margin:16px 0; border:none; border-top:1px solid #e5e7eb;" />
        <p style="margin:0; color:#6b7280; font-size:12px;">Tracking token: ${token}</p>
      </div>
    `

    await sgMail.send({
      to: parsed.data.email_address,
      from: fromEmail,
      subject,
      html,
      headers: {
        'X-Tracking-Token': token
      },
      attachments: [
        {
          content: pdf.toString('base64'),
          filename: `lead-verification-${parsed.data.analysis_id}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    })

    return NextResponse.json({ success: true, message: 'Email sent', token })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
