import type { TrackPoint } from '../types'

export interface Split {
  km: number
  seconds: number
  pace: string
}

function pace(seconds: number): string {
  const total = Math.round(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Per-full-kilometer splits derived from the track (interpolated at each 1 km mark). */
export function computeSplits(points: TrackPoint[]): Split[] {
  if (points.length < 2) return []
  const splits: Split[] = []
  let nextMark = 1000
  let prevMarkTime = new Date(points[0].t).getTime()
  let km = 1
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const cur = points[i]
    while (cur.dist >= nextMark) {
      const span = cur.dist - prev.dist || 1
      const frac = (nextMark - prev.dist) / span
      const markTime = new Date(prev.t).getTime() + frac * (new Date(cur.t).getTime() - new Date(prev.t).getTime())
      const secs = (markTime - prevMarkTime) / 1000
      splits.push({ km, seconds: secs, pace: pace(secs) })
      prevMarkTime = markTime
      nextMark += 1000
      km += 1
    }
  }
  return splits
}

/** Elevation vs. distance (km) series for charting; empty when there is no elevation. */
export function elevationSeries(points: TrackPoint[]): { km: number; ele: number }[] {
  const withEle = points.filter((p) => p.ele != null)
  if (withEle.length < 2) return []
  return withEle.map((p) => ({ km: +(p.dist / 1000).toFixed(2), ele: Math.round(p.ele as number) }))
}
