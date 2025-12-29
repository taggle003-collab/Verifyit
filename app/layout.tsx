import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter } from 'next/font/google'

import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'

import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lead Verification Tool — Taggle',
  description: 'Verify leads before you pitch using best-effort real-time public signals.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const taggleUrl = process.env.NEXT_PUBLIC_TAGGLE_URL || 'https://taggle.ai'

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-dvh flex flex-col">
            <header className="border-b">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-semibold">
                    V
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-semibold">Lead Verification Tool</span>
                    <Link
                      href={taggleUrl}
                      target="_blank"
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Built by Taggle
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={taggleUrl}
                    target="_blank"
                    className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground"
                  >
                    Try Taggle
                  </Link>
                  <ModeToggle />
                </div>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t">
              <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Built by{' '}
                  <Link href={taggleUrl} target="_blank" className="underline underline-offset-4">
                    Taggle
                  </Link>
                  . No login. No database storage.
                </span>
                <span>
                  Try Taggle’s full platform for lead generation & automation.
                </span>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
