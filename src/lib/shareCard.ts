import type { Activity, TrackPoint } from '../types'
import { formatDuration, formatKm, formatPaceOrSpeed, isPaceBased } from './format'

const ORANGE = '#fc4c02'
const INK = '#1f2328'
const SUB = '#6b7280'

function drawRoute(ctx: CanvasRenderingContext2D, points: TrackPoint[], x: number, y: number, w: number, h: number) {
  if (points.length < 2) return
  let minLat = 90
  let maxLat = -90
  let minLng = 180
  let maxLng = -180
  for (const p of points) {
    minLat = Math.min(minLat, p.lat)
    maxLat = Math.max(maxLat, p.lat)
    minLng = Math.min(minLng, p.lng)
    maxLng = Math.max(maxLng, p.lng)
  }
  const latRange = Math.max(1e-9, maxLat - minLat)
  const lngRange = Math.max(1e-9, maxLng - minLng)
  const pad = 48
  const iw = w - 2 * pad
  const ih = h - 2 * pad
  const scale = Math.min(iw / lngRange, ih / latRange)
  const offX = x + pad + (iw - lngRange * scale) / 2
  const offY = y + pad + (ih - latRange * scale) / 2
  const project = (p: TrackPoint): [number, number] => [
    offX + (p.lng - minLng) * scale,
    offY + (maxLat - p.lat) * scale,
  ]

  ctx.beginPath()
  points.forEach((p, i) => {
    const [px, py] = project(p)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  })
  ctx.strokeStyle = ORANGE
  ctx.lineWidth = 8
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.stroke()

  const dot = (p: TrackPoint, color: string) => {
    const [px, py] = project(p)
    ctx.beginPath()
    ctx.arc(px, py, 10, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }
  dot(points[0], '#16a34a')
  dot(points[points.length - 1], '#ef4444')
}

/** Renders a shareable card for an activity to a PNG blob. */
export async function renderShareCard(activity: Activity, points: TrackPoint[]): Promise<Blob> {
  await document.fonts.ready
  const W = 900
  const H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Route band.
  const bandH = 560
  ctx.fillStyle = '#fff3ed'
  ctx.fillRect(0, 0, W, bandH)
  if (points.length > 1) {
    drawRoute(ctx, points, 0, 0, W, bandH)
  }

  // Title.
  let y = bandH + 80
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = INK
  ctx.font = '800 46px Inter, sans-serif'
  ctx.fillText(truncate(ctx, activity.title, W - 96), 48, y)

  y += 42
  ctx.fillStyle = SUB
  ctx.font = '500 26px Inter, sans-serif'
  ctx.fillText(
    new Date(activity.started_at).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
    48,
    y,
  )

  // Stats.
  y += 90
  const paceLabel = isPaceBased(activity.type) ? 'Pace' : 'km/h'
  const paceVal = formatPaceOrSpeed(activity.type, activity.avg_speed_mps).replace(' /km', '').replace(' km/h', '')
  const stats: [string, string][] = [
    [`${formatKm(activity.distance_meters)} km`, 'Jarak'],
    [formatDuration(activity.moving_seconds), 'Waktu'],
    [paceVal, paceLabel],
  ]
  const colW = (W - 96) / 3
  stats.forEach(([value, label], i) => {
    const cx = 48 + i * colW
    ctx.fillStyle = INK
    ctx.font = '800 52px Inter, sans-serif'
    ctx.fillText(value, cx, y)
    ctx.fillStyle = SUB
    ctx.font = '500 24px Inter, sans-serif'
    ctx.fillText(label, cx, y + 34)
  })

  // Branding.
  ctx.fillStyle = ORANGE
  ctx.font = '800 34px Inter, sans-serif'
  ctx.fillText('◈ Jejak', 48, H - 56)

  return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1)
  return t + '…'
}

/** Renders the card and shares it (Web Share API) or downloads it as a fallback. */
export async function shareActivityImage(activity: Activity, points: TrackPoint[]) {
  const blob = await renderShareCard(activity, points)
  const file = new File([blob], `jejak-${activity.id}.png`, { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: activity.title })
      return
    } catch {
      // user cancelled or share failed → fall through to download
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
