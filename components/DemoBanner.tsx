'use client'

import * as React from 'react'

export function DemoBanner() {
  const [isConfigured, setIsConfigured] = React.useState(true)

  React.useEffect(() => {
    // In a real app, you might check this via an API call or a prop from a server component
    // For this demo, we can check if certain expected env vars are missing
    // But since we can't easily check process.env on the client for non-public vars,
    // we'll assume we want to show it if we are in this "demo" state.
    // However, the instructions say "visible when no env vars".
    
    // Let's check if the NEXT_PUBLIC_SUPABASE_URL is set as a proxy for "configured"
    const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    setIsConfigured(configured)
  }, [])

  if (isConfigured) return null

  return (
    <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 text-center">
      <p className="text-sm font-medium text-primary">
        🎯 Demo Mode: Using sample data. Set environment variables for real functionality.
      </p>
    </div>
  )
}
