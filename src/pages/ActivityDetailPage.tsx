import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import { CircleMarker, MapContainer, Polyline, TileLayer } from 'react-leaflet'
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ActivityIcon } from '../lib/activityIcon'
import { computeSplits, elevationSeries } from '../lib/track'
import {
  formatDateTime,
  formatDuration,
  formatElevation,
  formatKm,
  formatPaceOrSpeed,
  formatSpeed,
  isPaceBased,
} from '../lib/format'
import { downloadGPX, useActivity, useDeleteActivity } from '../lib/queries'
import type { ActivityDetail } from '../types'

export default function ActivityDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useActivity(id)
  const del = useDeleteActivity()

  const handleDelete = async () => {
    if (!confirm('Hapus aktivitas ini?')) return
    await del.mutateAsync(id)
    navigate('/activities')
  }

  if (isLoading) return <p className="text-stone-500">Memuat…</p>
  if (isError || !data) return <p className="text-stone-500">Aktivitas tidak ditemukan.</p>

  return (
    <div className="space-y-6">
      <Link to="/activities" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-800">
        <ArrowLeft size={16} /> Kembali
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-primary-50 text-primary-600">
            <ActivityIcon type={data.type} size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{data.title}</h1>
            <p className="text-sm text-stone-500">{formatDateTime(data.started_at)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadGPX(data.id, data.title)}
            className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-stone-50"
          >
            <Download size={16} /> GPX
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {data.points.length > 1 && <RouteMap detail={data} />}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Jarak" value={`${formatKm(data.distance_meters)} km`} />
        <Stat label={isPaceBased(data.type) ? 'Pace' : 'Kecepatan'} value={formatPaceOrSpeed(data.type, data.avg_speed_mps)} />
        <Stat label="Waktu Gerak" value={formatDuration(data.moving_seconds)} />
        <Stat label="Total Waktu" value={formatDuration(data.elapsed_seconds)} />
        <Stat label="Elevasi Naik" value={formatElevation(data.elevation_gain_m)} />
        <Stat label="Kecepatan Maks" value={formatSpeed(data.max_speed_mps)} />
      </div>

      <ElevationChart detail={data} />
      <Splits detail={data} />

      {data.notes && <p className="text-stone-600">{data.notes}</p>}
    </div>
  )
}

function ElevationChart({ detail }: { detail: ActivityDetail }) {
  const series = elevationSeries(detail.points)
  if (series.length < 2) return null
  return (
    <div className="card">
      <p className="mb-3 text-sm font-semibold text-stone-500">Profil Elevasi</p>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={series} margin={{ left: -18, right: 8, top: 4 }}>
          <defs>
            <linearGradient id="ele" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fc4c02" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#fc4c02" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="km" tickLine={false} axisLine={false} fontSize={11} unit=" km" />
          <YAxis tickLine={false} axisLine={false} fontSize={11} width={36} unit=" m" />
          <Tooltip formatter={(v) => [`${v} m`, 'Elevasi']} labelFormatter={(l) => `${l} km`} />
          <Area type="monotone" dataKey="ele" stroke="#fc4c02" strokeWidth={2} fill="url(#ele)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function Splits({ detail }: { detail: ActivityDetail }) {
  const splits = computeSplits(detail.points)
  if (splits.length === 0) return null
  const slowest = Math.max(...splits.map((s) => s.seconds))
  return (
    <div className="card">
      <p className="mb-3 text-sm font-semibold text-stone-500">Splits per km</p>
      <div className="space-y-2">
        {splits.map((s) => (
          <div key={s.km} className="flex items-center gap-3">
            <span className="w-6 text-sm font-semibold text-stone-500">{s.km}</span>
            <div className="h-6 flex-1 rounded bg-stone-100">
              <div
                className="flex h-6 items-center rounded bg-primary-500 px-2 text-xs font-bold text-white"
                style={{ width: `${Math.max(18, (s.seconds / slowest) * 100)}%` }}
              >
                {s.pace}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RouteMap({ detail }: { detail: ActivityDetail }) {
  const path: LatLngExpression[] = detail.points.map((p) => [p.lat, p.lng])
  const bounds: LatLngBoundsExpression = path as LatLngBoundsExpression
  const start = path[0]
  const end = path[path.length - 1]

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200">
      <MapContainer bounds={bounds} boundsOptions={{ padding: [30, 30] }} style={{ height: 340, width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <Polyline positions={path} pathOptions={{ color: '#fc4c02', weight: 5 }} />
        <CircleMarker center={start} radius={7} pathOptions={{ color: '#fff', fillColor: '#16a34a', fillOpacity: 1, weight: 2 }} />
        <CircleMarker center={end} radius={7} pathOptions={{ color: '#fff', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }} />
      </MapContainer>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-xs font-semibold text-stone-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
    </div>
  )
}
