export interface User {
  id: string
  name: string
  email: string
}

export type ActivityType = 'run' | 'ride' | 'walk' | 'hike' | 'other'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  notes?: string | null
  source: string
  started_at: string
  elapsed_seconds: number
  moving_seconds: number
  distance_meters: number
  avg_speed_mps: number
  max_speed_mps: number
  elevation_gain_m: number
  elevation_loss_m: number
  polyline: string
  point_count: number
}

export interface TrackPoint {
  lat: number
  lng: number
  ele?: number | null
  t: string
  dist: number
}

export interface ActivityDetail extends Activity {
  points: TrackPoint[]
}

export interface StatBucket {
  type: string
  count: number
  distance_meters: number
  moving_seconds: number
  elevation_gain_m: number
}

export interface PeriodTotals {
  count: number
  distance_meters: number
  moving_seconds: number
  elevation_gain_m: number
  by_type: StatBucket[]
}

export interface StatsSummary {
  week: PeriodTotals
  month: PeriodTotals
  year: PeriodTotals
  all_time: PeriodTotals
}

export interface PersonalRecord {
  activity_type: string
  record_type: string
  value: number
  activity_id: string
  achieved_at: string
}
