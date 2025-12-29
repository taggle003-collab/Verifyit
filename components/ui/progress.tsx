'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export function Progress({ value, className }: { value?: number; className?: string }) {
  const clamped = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : undefined

  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <div
        className={cn(
          'h-full w-full flex-1 bg-primary transition-all',
          typeof clamped === 'number' ? '' : 'animate-pulse'
        )}
        style={typeof clamped === 'number' ? { transform: `translateX(-${100 - clamped}%)` } : undefined}
      />
    </div>
  )
}
