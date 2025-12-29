'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, ShieldAlert } from 'lucide-react'

import type { AnalysisResult, LeadData } from '@/lib/analysis/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScoreGauge } from '@/components/ScoreGauge'
import { CompanyProfile } from '@/components/CompanyProfile'
import { ExportButtons } from '@/components/ExportButtons'

function VerdictIcon({ verdict }: { verdict: AnalysisResult['verdict'] }) {
  if (verdict === 'pitch') return <CheckCircle2 className="h-5 w-5" />
  return <XCircle className="h-5 w-5" />
}

export function ResultsDisplay({
  analysisId,
  lead,
  analysis,
  expiresAt
}: {
  analysisId: string
  lead: LeadData
  analysis: AnalysisResult
  expiresAt: string
}) {
  const router = useRouter()
  const [deleting, setDeleting] = React.useState(false)

  const good = analysis.verdict === 'pitch'

  async function deleteNow() {
    const ok = window.confirm('Ready to delete this analysis forever? This cannot be recovered.')
    if (!ok) return

    setDeleting(true)
    try {
      await fetch(`/api/analysis/${analysisId}`, { method: 'DELETE' })
    } finally {
      setDeleting(false)
      router.replace('/')
    }
  }

  return (
    <div className="grid gap-6">
      <div
        className={
          good
            ? 'rounded-lg border bg-emerald-500/10 p-6 text-emerald-700 dark:text-emerald-300'
            : 'rounded-lg border bg-red-500/10 p-6 text-red-700 dark:text-red-300'
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xl font-semibold">
              <VerdictIcon verdict={analysis.verdict} />
              {good ? 'Pitch This Lead' : 'Not Ready to Pitch'}
            </div>
            <div className="mt-1 text-sm opacity-80">
              Confidence: {analysis.confidence} ({analysis.confidence_percent}%)
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative h-[104px] w-[104px]">
              <ScoreGauge score={analysis.overall_score} className="absolute inset-0" />
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm opacity-80">
          Analysis will automatically delete at {new Date(expiresAt).toLocaleString()} (or you can delete now).
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {(
                [
                  ['Company Growth', analysis.breakdown.company_growth],
                  ['Recent Social Activity', analysis.breakdown.social_activity],
                  ['Job Title / Seniority', analysis.breakdown.job_title],
                  ['Hiring Intent', analysis.breakdown.hiring_intent],
                  ['Industry / Market Fit', analysis.breakdown.market_fit]
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="grid gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}/100</span>
                  </div>
                  <Progress value={value} />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Reasons For Pitching</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {analysis.reasons_for_pitching.map((r) => (
                    <li key={r} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reasons Against Pitching</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {analysis.reasons_against_pitching.map((r) => (
                    <li key={r} className="flex gap-2">
                      <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-500" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Messaging Angles</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {analysis.recommended_messaging.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <ExportButtons analysisId={analysisId} />
              <div className="text-xs text-muted-foreground">
                If you download or email a report, your data will be automatically deleted within 24 hours.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delete this analysis</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-sm text-muted-foreground">
                Ready to delete this analysis forever? Once deleted, it cannot be recovered.
              </p>
              <Button variant="destructive" onClick={deleteNow} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete forever'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <CompanyProfile profile={analysis.company_profile} />

          <Card>
            <CardHeader>
              <CardTitle>Lead Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="text-sm grid gap-1">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{lead.name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium">{lead.title}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Company</span>
                <span className="font-medium">{lead.company}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">History window</span>
                <span className="font-medium">{lead.historyWindow}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scraped Signals (Summary)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              {Object.values(analysis.scraped_signals).map((s) => (
                <div key={s.platform} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium capitalize">{s.platform}</div>
                    <div className="text-xs text-muted-foreground">{s.confidence}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Activity</div>
                      <div className="font-medium">{s.activity_score}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Engagement</div>
                      <div className="font-medium">{s.engagement_score}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Posts</div>
                      <div className="font-medium">{s.recent_posts_count}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
