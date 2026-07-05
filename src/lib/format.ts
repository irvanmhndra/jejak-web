export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`
  return `${Math.round(meters)} m`
}

export function formatKm(meters: number): string {
  return (meters / 1000).toFixed(2)
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function isPaceBased(type: string): boolean {
  return type !== 'ride'
}

export function formatPace(speedMps: number): string {
  if (speedMps <= 0) return '--:-- /km'
  const total = Math.round(1000 / speedMps)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')} /km`
}

export function formatSpeed(speedMps: number): string {
  return `${(speedMps * 3.6).toFixed(1)} km/h`
}

export function formatPaceOrSpeed(type: string, speedMps: number): string {
  return isPaceBased(type) ? formatPace(speedMps) : formatSpeed(speedMps)
}

export function formatElevation(meters: number): string {
  return `${Math.round(meters)} m`
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const activityTypeLabels: Record<string, string> = {
  run: 'Lari',
  ride: 'Bersepeda',
  walk: 'Jalan',
  hike: 'Hiking',
  other: 'Aktivitas',
}

export function activityTypeLabel(type: string): string {
  return activityTypeLabels[type] ?? 'Aktivitas'
}
