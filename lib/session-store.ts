import 'server-only'

import { randomUUID } from 'crypto'
import type { AnalysisResult, LeadData } from '@/lib/analysis/types'

type StoredAnalysis = {
  id: string
  lead: LeadData
  analysis: AnalysisResult
  createdAt: number
  expiresAt: number
}

const STORE_KEY = '__verifyit_analysis_store__'
const CLEANUP_KEY = '__verifyit_analysis_store_cleanup__'

function getStore(): Map<string, StoredAnalysis> {
  const g = globalThis as unknown as Record<string, unknown>
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map<string, StoredAnalysis>()
  }
  return g[STORE_KEY] as Map<string, StoredAnalysis>
}

function ensureCleanupLoop() {
  const g = globalThis as unknown as Record<string, unknown>
  if (g[CLEANUP_KEY]) return

  g[CLEANUP_KEY] = setInterval(() => {
    const store = getStore()
    const now = Date.now()
    for (const [id, item] of store.entries()) {
      if (item.expiresAt <= now) store.delete(id)
    }
  }, 60_000)
}

export function createAnalysis(params: { lead: LeadData; analysis: AnalysisResult }, ttlMs = 24 * 60 * 60 * 1000) {
  ensureCleanupLoop()

  const id = randomUUID()
  const now = Date.now()
  const stored: StoredAnalysis = {
    id,
    lead: params.lead,
    analysis: params.analysis,
    createdAt: now,
    expiresAt: now + ttlMs
  }
  getStore().set(id, stored)
  return { id, expiresAt: stored.expiresAt }
}

export function getAnalysis(id: string): StoredAnalysis | null {
  ensureCleanupLoop()

  const item = getStore().get(id)
  if (!item) return null
  if (item.expiresAt <= Date.now()) {
    getStore().delete(id)
    return null
  }
  return item
}

export function deleteAnalysis(id: string) {
  getStore().delete(id)
}
