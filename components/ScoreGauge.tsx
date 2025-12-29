'use client'

import { cn } from '@/lib/utils'

export function ScoreGauge({ score, className }: { score: number; className?: string }) {
  const radius = 52
  const stroke = 10
  const normalizedRadius = radius - stroke * 0.5
  const circumference = normalizedRadius * 2 * Math.PI

  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference - (clamped / 100) * circumference

  const color = clamped >= 65 ? 'stroke-emerald-500' : 'stroke-red-500'

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          strokeWidth={stroke}
          className="stroke-muted"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          strokeWidth={stroke}
          className={cn(color)}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-semibold">{clamped}</div>
        <div className="text-xs text-muted-foreground">/ 100</div>
      </div>
    </div>
  )
}
