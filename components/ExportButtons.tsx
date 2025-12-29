'use client'

import * as React from 'react'
import { Download, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ExportButtons({ analysisId }: { analysisId: string }) {
  const [open, setOpen] = React.useState(false)
  const [recipientEmail, setRecipientEmail] = React.useState('')
  const [recipientName, setRecipientName] = React.useState('')
  const [isSending, setIsSending] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  async function sendEmail() {
    setMessage(null)
    setIsSending(true)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: analysisId,
          email_address: recipientEmail,
          recipient_name: recipientName || undefined
        })
      })

      const json = await res.json()
      if (!res.ok) {
        setMessage(json?.error || 'Failed to send email')
        return
      }

      setMessage('Report sent. Data will be deleted automatically within 24 hours.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button asChild variant="outline">
        <a href={`/api/export/pdf/${analysisId}`}>
          <Download className="h-4 w-4" /> Download as PDF
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={`/api/export/docx/${analysisId}`}>
          <Download className="h-4 w-4" /> Download as DOCX
        </a>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">
            <Mail className="h-4 w-4" /> Email report
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email this report</DialogTitle>
            <DialogDescription>
              We will generate a PDF and deliver it via SendGrid. The analysis will expire automatically within 24 hours.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="recipientEmail">Recipient email</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="name@company.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipientName">Recipient name (optional)</Label>
              <Input
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Alex"
              />
            </div>
            {message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              onClick={sendEmail}
              disabled={isSending || !recipientEmail}
            >
              {isSending ? 'Sending…' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
