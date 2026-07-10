import type { Activity } from '../types'

export interface WeekBucket {
  label: string
  km: number
}

/** Monday 00:00 of the week containing `d`. */
function startOfWeek(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const day = (x.getDay() + 6) % 7 // Mon=0 … Sun=6
  x.setDate(x.getDate() - day)
  return x
}

/** Distance (km) per week for the last `weeks` weeks, oldest → newest. */
export function weeklyTrend(activities: Activity[], weeks = 12): WeekBucket[] {
  const thisMonday = startOfWeek(new Date())
  const buckets: { start: number; km: number }[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(thisMonday)
    start.setDate(start.getDate() - i * 7)
    buckets.push({ start: start.getTime(), km: 0 })
  }
  const weekMs = 7 * 24 * 60 * 60 * 1000
  for (const a of activities) {
    const t = new Date(a.started_at).getTime()
    for (const b of buckets) {
      if (t >= b.start && t < b.start + weekMs) {
        b.km += a.distance_meters / 1000
        break
      }
    }
  }
  const fmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
  return buckets.map((b) => ({ label: fmt.format(new Date(b.start)), km: +b.km.toFixed(1) }))
}
