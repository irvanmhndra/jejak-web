import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { ActivityIcon } from '../lib/activityIcon'
import { formatDateTime, formatDuration, formatKm } from '../lib/format'
import { useActivities, useStats } from '../lib/queries'
import { weeklyTrend } from '../lib/trend'
import type { Activity, PeriodTotals } from '../types'

export default function DashboardPage() {
  const stats = useStats()
  const activities = useActivities()
  const trend = activities.data ? weeklyTrend(activities.data, 12) : []

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <PeriodCard label="Minggu Ini" totals={stats.data?.week} loading={stats.isLoading} />
        <PeriodCard label="Bulan Ini" totals={stats.data?.month} loading={stats.isLoading} />
        <PeriodCard label="Sepanjang Waktu" totals={stats.data?.all_time} loading={stats.isLoading} />
      </div>

      {trend.some((w) => w.km > 0) && (
        <div className="card">
          <p className="mb-4 text-sm font-semibold text-stone-500">Tren Mingguan (km) — 12 minggu terakhir</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trend} margin={{ left: -20, right: 8, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} interval="preserveStartEnd" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} unit=" km" />
              <Tooltip cursor={{ fill: '#fff3ed' }} formatter={(v) => [`${v} km`, 'Jarak']} />
              <Bar dataKey="km" fill="#fc4c02" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Aktivitas Terbaru</h2>
          <Link to="/activities" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
            Lihat semua
          </Link>
        </div>

        {activities.isLoading ? (
          <p className="text-stone-500">Memuat…</p>
        ) : activities.data && activities.data.length > 0 ? (
          <div className="space-y-3">
            {activities.data.slice(0, 8).map((a) => (
              <ActivityRow key={a.id} activity={a} />
            ))}
          </div>
        ) : (
          <div className="card text-center text-stone-500">
            Belum ada aktivitas. Rekam lewat aplikasi mobile atau tambah manual.
          </div>
        )}
      </div>
    </div>
  )
}

function PeriodCard({ label, totals, loading }: { label: string; totals?: PeriodTotals; loading: boolean }) {
  return (
    <div className="card">
      <p className="text-sm font-semibold text-stone-500">{label}</p>
      {loading || !totals ? (
        <p className="mt-3 text-stone-400">—</p>
      ) : (
        <div className="mt-3">
          <p className="text-3xl font-extrabold leading-none">
            {formatKm(totals.distance_meters)}
            <span className="ml-1 text-base font-semibold text-stone-400">km</span>
          </p>
          <p className="mt-2 text-sm text-stone-500">
            {formatDuration(totals.moving_seconds)} · {totals.count} aktivitas
          </p>
        </div>
      )}
    </div>
  )
}

function ActivityRow({ activity }: { activity: Activity }) {
  return (
    <Link
      to={`/activities/${activity.id}`}
      className="card flex items-center gap-4 transition-colors hover:border-primary-200 hover:bg-primary-50/30"
    >
      <div className="grid h-11 w-11 place-items-center rounded-full bg-primary-50 text-primary-600">
        <ActivityIcon type={activity.type} size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{activity.title}</p>
        <p className="text-sm text-stone-500">{formatDateTime(activity.started_at)}</p>
      </div>
      <div className="text-right">
        <p className="font-bold">{formatKm(activity.distance_meters)} km</p>
        <p className="text-sm text-stone-500">{formatDuration(activity.moving_seconds)}</p>
      </div>
    </Link>
  )
}
