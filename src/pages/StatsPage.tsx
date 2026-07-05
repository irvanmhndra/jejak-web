import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ActivityIcon } from '../lib/activityIcon'
import {
  activityTypeLabel,
  formatDate,
  formatDistance,
  formatDuration,
  formatElevation,
  formatKm,
  formatPaceOrSpeed,
} from '../lib/format'
import { useRecords, useStats } from '../lib/queries'
import type { PeriodTotals, PersonalRecord } from '../types'

export default function StatsPage() {
  const stats = useStats()
  const records = useRecords()

  const chartData =
    stats.data?.all_time.by_type.map((b) => ({
      name: activityTypeLabel(b.type),
      km: +(b.distance_meters / 1000).toFixed(1),
    })) ?? []

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Statistik</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PeriodCard label="Minggu Ini" t={stats.data?.week} />
        <PeriodCard label="Bulan Ini" t={stats.data?.month} />
        <PeriodCard label="Tahun Ini" t={stats.data?.year} />
        <PeriodCard label="Sepanjang Waktu" t={stats.data?.all_time} />
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <p className="mb-4 text-sm font-semibold text-stone-500">Jarak per Tipe (km)</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={32} />
              <Tooltip cursor={{ fill: '#fff3ed' }} />
              <Bar dataKey="km" fill="#fc4c02" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-bold">Rekor Pribadi</h2>
        {records.isLoading ? (
          <p className="text-stone-500">Memuat…</p>
        ) : records.data && records.data.length > 0 ? (
          <div className="space-y-3">
            {records.data.map((r) => (
              <RecordRow key={`${r.activity_type}-${r.record_type}`} record={r} />
            ))}
          </div>
        ) : (
          <div className="card text-center text-stone-500">Belum ada rekor.</div>
        )}
      </div>
    </div>
  )
}

function PeriodCard({ label, t }: { label: string; t?: PeriodTotals }) {
  return (
    <div className="card">
      <p className="text-sm font-semibold text-stone-500">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric value={t ? formatKm(t.distance_meters) : '—'} label="km" />
        <Metric value={t ? formatDuration(t.moving_seconds) : '—'} label="waktu" />
        <Metric value={t ? String(t.count) : '—'} label="aktivitas" />
        <Metric value={t ? formatElevation(t.elevation_gain_m) : '—'} label="elevasi" />
      </div>
    </div>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-lg font-extrabold leading-tight">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  )
}

function RecordRow({ record }: { record: PersonalRecord }) {
  const [label, value] = describe(record)
  return (
    <div className="card flex items-center gap-4">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-primary-50 text-primary-600">
        <ActivityIcon type={record.activity_type} size={20} />
      </div>
      <div className="flex-1">
        <p className="font-semibold">
          {activityTypeLabel(record.activity_type)} — {label}
        </p>
        <p className="text-sm text-stone-500">{formatDate(record.achieved_at)}</p>
      </div>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  )
}

function describe(r: PersonalRecord): [string, string] {
  switch (r.record_type) {
    case 'longest_distance':
      return ['Jarak terjauh', formatDistance(r.value)]
    case 'longest_duration':
      return ['Durasi terlama', formatDuration(Math.round(r.value))]
    case 'most_elevation':
      return ['Elevasi terbanyak', formatElevation(r.value)]
    case 'fastest_speed':
      return ['Tercepat', formatPaceOrSpeed(r.activity_type, r.value)]
    default:
      return [r.record_type, String(Math.round(r.value))]
  }
}
