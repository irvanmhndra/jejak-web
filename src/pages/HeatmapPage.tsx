import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet'
import { decodePolyline } from '../lib/polyline'
import { useActivities } from '../lib/queries'

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap()
  useEffect(() => {
    // Re-measure once the CSS-sized container has settled, then fit.
    const fit = () => {
      map.invalidateSize()
      map.fitBounds(bounds, { padding: [40, 40] })
    }
    fit()
    const t = setTimeout(fit, 300)
    return () => clearTimeout(t)
  }, [map, bounds])
  return null
}

export default function HeatmapPage() {
  const activities = useActivities()

  const routes = useMemo(() => {
    return (activities.data ?? [])
      .filter((a) => a.polyline)
      .map((a) => decodePolyline(a.polyline) as LatLngExpression[])
      .filter((pts) => pts.length > 1)
  }, [activities.data])

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    const all = routes.flat() as [number, number][]
    if (all.length < 1) return null
    let minLat = 90
    let minLng = 180
    let maxLat = -90
    let maxLng = -180
    for (const [lat, lng] of all) {
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
    }
    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ]
  }, [routes])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">Heatmap Rute</h1>
        <p className="text-sm text-stone-500">
          Semua rute aktivitasmu ({routes.length}) — makin sering dilewati, makin pekat.
        </p>
      </div>

      {activities.isLoading ? (
        <p className="text-stone-500">Memuat…</p>
      ) : bounds ? (
        <div className="overflow-hidden rounded-xl border border-stone-200">
          <MapContainer center={[-6.2, 106.81]} zoom={12} style={{ height: 560, width: '100%' }} scrollWheelZoom>
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            <FitBounds bounds={bounds} />
            {routes.map((pts, i) => (
              <Polyline key={i} positions={pts} pathOptions={{ color: '#fc4c02', weight: 4, opacity: 0.35 }} />
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="card text-center text-stone-500">Belum ada rute ber-GPS. Rekam aktivitas dulu.</div>
      )}
    </div>
  )
}
