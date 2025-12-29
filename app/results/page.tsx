import Link from 'next/link'

import { ResultsDisplay } from '@/components/ResultsDisplay'
import { Button } from '@/components/ui/button'
import { getAnalysis } from '@/lib/session-store'

export const dynamic = 'force-dynamic'

export default function ResultsPage({
  searchParams
}: {
  searchParams: { id?: string }
}) {
  const { id } = searchParams

  if (!id) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border p-6">
          <h1 className="text-xl font-semibold">Missing analysis ID</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start a verification from the home page.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const item = getAnalysis(id)

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border p-6">
          <h1 className="text-xl font-semibold">Analysis not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This analysis may have been deleted or expired.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/">Run a new verification</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ResultsDisplay
        analysisId={item.id}
        lead={item.lead}
        analysis={item.analysis}
        expiresAt={new Date(item.expiresAt).toISOString()}
      />
    </div>
  )
}
