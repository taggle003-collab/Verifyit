'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { leadDataSchema, verifyRequestSchema, type HistoryWindow } from '@/lib/analysis/types'

const platforms = ['X', 'Reddit', 'Instagram', 'LinkedIn', 'Facebook'] as const

export function VerificationForm() {
  const router = useRouter()

  const [lead, setLead] = React.useState({
    name: '',
    email: '',
    title: '',
    company: '',
    location: '',
    historyWindow: '3months' as HistoryWindow,
    profileLinks: {
      linkedin: '',
      x: '',
      other: ''
    }
  })

  const [consentScraping, setConsentScraping] = React.useState(false)
  const [consentDeletion, setConsentDeletion] = React.useState(false)

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [serverError, setServerError] = React.useState<string | null>(null)

  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState<number>(0)
  const [platformStep, setPlatformStep] = React.useState(0)

  const canSubmit = consentScraping && consentDeletion

  function setField<K extends keyof typeof lead>(key: K, value: (typeof lead)[K]) {
    setLead((prev) => ({ ...prev, [key]: value }))
  }

  function setProfileLink(key: keyof typeof lead.profileLinks, value: string) {
    setLead((prev) => ({
      ...prev,
      profileLinks: {
        ...prev.profileLinks,
        [key]: value
      }
    }))
  }

  function validate() {
    const parsed = leadDataSchema.safeParse({
      ...lead,
      profileLinks: {
        linkedin: lead.profileLinks.linkedin || undefined,
        x: lead.profileLinks.x || undefined,
        other: lead.profileLinks.other || undefined
      }
    })

    if (parsed.success) {
      setErrors({})
      return { ok: true as const, data: parsed.data }
    }

    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.')
      fieldErrors[path] = issue.message
    }
    setErrors(fieldErrors)
    return { ok: false as const }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    const v = validate()
    if (!v.ok) return

    const req = {
      lead: v.data,
      consent_scraping: consentScraping,
      consent_deletion: consentDeletion
    }

    const reqParsed = verifyRequestSchema.safeParse(req)
    if (!reqParsed.success) {
      setServerError('Please confirm the consent checkboxes to proceed.')
      return
    }

    setLoading(true)
    setProgress(8)
    setPlatformStep(0)

    const tick = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p
        return p + Math.random() * 6
      })
      setPlatformStep((s) => (s < platforms.length ? s + 1 : s))
    }, 900)

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json?.error || 'Verification failed')
        return
      }

      const analysisId = String(json.analysis_id)
      try {
        sessionStorage.setItem('verifyit:last_analysis_id', analysisId)
      } catch {
        // ignore
      }

      setProgress(100)
      router.push(`/results?id=${encodeURIComponent(analysisId)}`)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      window.clearInterval(tick)
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyze a Lead</CardTitle>
        <CardDescription>
          Best-effort public scraping in real time. No login required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Lead name *</Label>
            <Input id="name" value={lead.name} onChange={(e) => setField('name', e.target.value)} />
            {errors['name'] ? <div className="text-sm text-destructive">{errors['name']}</div> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email address *</Label>
            <Input
              id="email"
              type="email"
              value={lead.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="name@company.com"
            />
            {errors['email'] ? <div className="text-sm text-destructive">{errors['email']}</div> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Job title *</Label>
            <Input id="title" value={lead.title} onChange={(e) => setField('title', e.target.value)} />
            {errors['title'] ? <div className="text-sm text-destructive">{errors['title']}</div> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company">Company name *</Label>
            <Input id="company" value={lead.company} onChange={(e) => setField('company', e.target.value)} />
            {errors['company'] ? <div className="text-sm text-destructive">{errors['company']}</div> : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location / Industry *</Label>
            <Input
              id="location"
              value={lead.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="e.g., New York • Fintech"
            />
            {errors['location'] ? <div className="text-sm text-destructive">{errors['location']}</div> : null}
          </div>

          <div className="grid gap-2">
            <Label>History window</Label>
            <RadioGroup
              value={lead.historyWindow}
              onValueChange={(v) => setField('historyWindow', v as HistoryWindow)}
              className="grid gap-2 sm:grid-cols-3"
            >
              <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <RadioGroupItem value="3months" />
                Last 3 Months
              </label>
              <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <RadioGroupItem value="6months" />
                Last 6 Months
              </label>
              <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <RadioGroupItem value="1year" />
                Last 1 Year
              </label>
            </RadioGroup>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label className="text-sm">Profile links (optional)</Label>
              <div className="grid gap-2">
                <Input
                  value={lead.profileLinks.linkedin}
                  onChange={(e) => setProfileLink('linkedin', e.target.value)}
                  placeholder="LinkedIn profile URL"
                />
                <Input
                  value={lead.profileLinks.x}
                  onChange={(e) => setProfileLink('x', e.target.value)}
                  placeholder="X profile URL"
                />
                <Input
                  value={lead.profileLinks.other}
                  onChange={(e) => setProfileLink('other', e.target.value)}
                  placeholder="Other profile URL"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="consentScraping"
                  checked={consentScraping}
                  onCheckedChange={(v) => setConsentScraping(Boolean(v))}
                />
                <Label htmlFor="consentScraping" className="leading-snug">
                  I consent to real-time social media scraping
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="consentDeletion"
                  checked={consentDeletion}
                  onCheckedChange={(v) => setConsentDeletion(Boolean(v))}
                />
                <Label htmlFor="consentDeletion" className="leading-snug">
                  I understand all data will be permanently deleted after verification
                </Label>
              </div>
            </div>
          </div>

          {serverError ? <div className="text-sm text-destructive">{serverError}</div> : null}

          <Button type="submit" disabled={!canSubmit || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
              </>
            ) : (
              'Verify'
            )}
          </Button>

          {loading ? (
            <div className="grid gap-3">
              <Progress value={progress} />
              <div className="text-xs text-muted-foreground">
                Scraping platforms: {platforms.slice(0, Math.min(platformStep, platforms.length)).join(', ')}
              </div>
            </div>
          ) : null}

          <div className="text-xs text-muted-foreground">
            By using this tool, you confirm you have the right to evaluate this lead and will comply with each platform’s terms.
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
