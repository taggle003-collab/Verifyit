import { Building2, MapPin, Users } from 'lucide-react'

import type { AnalysisResult } from '@/lib/analysis/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CompanyProfile({ profile }: { profile: AnalysisResult['company_profile'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{profile.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{profile.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>Employees: {profile.estimated_employees ?? 'Unknown'}</span>
        </div>
        <div>
          <div className="text-muted-foreground">Primary business</div>
          <div className="mt-1">{profile.primary_business}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Recent milestones</div>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            {profile.recent_milestones.slice(0, 5).map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
