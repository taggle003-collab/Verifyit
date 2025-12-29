import { VerificationForm } from '@/components/VerificationForm'
import { DemoBanner } from '@/components/DemoBanner'

export default function HomePage() {
  return (
    <>
      <DemoBanner />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Verify Leads <span className="text-primary">Before</span> You Pitch
            </h1>
            <p className="text-muted-foreground text-lg">
              Real-time, best-effort public signal checks across social platforms—no login required.
            </p>

            <div className="grid gap-3">
              <div className="rounded-lg border p-4">
                <h2 className="font-medium">How it works</h2>
                <ol className="mt-2 list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Enter lead + company details.</li>
                  <li>Select a history window (3 months, 6 months, or 1 year).</li>
                  <li>We scrape best-effort public signals in real time.</li>
                  <li>Get a pitch verdict, reasons, and exportable report.</li>
                </ol>
              </div>

              <div className="rounded-lg border p-4">
                <h2 className="font-medium">Privacy promise</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  No database persistence. Analyses are stored only temporarily (up to 24 hours) so you can download or email the report, and you can delete immediately.
                </p>
              </div>
            </div>
          </div>

          <div>
            <VerificationForm />
          </div>
        </section>
      </div>
    </>
  )
}
