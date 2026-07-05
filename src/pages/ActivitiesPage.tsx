import { Plus, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActivityIcon } from '../lib/activityIcon'
import { activityTypeLabel, formatDateTime, formatDuration, formatKm } from '../lib/format'
import { useActivities, useImportGPX } from '../lib/queries'
import ManualModal from './ManualModal'

const FILTERS = ['all', 'run', 'ride', 'walk', 'hike'] as const

export default function ActivitiesPage() {
  const activities = useActivities()
  const importGPX = useImportGPX()
  const fileRef = useRef<HTMLInputElement>(null)
  const [filter, setFilter] = useState<string>('all')
  const [showManual, setShowManual] = useState(false)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importGPX.mutateAsync(file)
    } catch {
      alert('Gagal impor GPX. Pastikan file valid.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const list = (activities.data ?? []).filter((a) => filter === 'all' || a.type === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Aktivitas</h1>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".gpx,application/gpx+xml,text/xml" hidden onChange={onFile} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importGPX.isPending}
            className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-stone-50 disabled:opacity-60"
          >
            <Upload size={16} />
            {importGPX.isPending ? 'Mengimpor…' : 'Impor GPX'}
          </button>
          <button
            onClick={() => setShowManual(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
          >
            <Plus size={16} />
            Input Manual
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              filter === f ? 'bg-primary-500 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {f === 'all' ? 'Semua' : activityTypeLabel(f)}
          </button>
        ))}
      </div>

      {activities.isLoading ? (
        <p className="text-stone-500">Memuat…</p>
      ) : list.length > 0 ? (
        <div className="space-y-3">
          {list.map((a) => (
            <Link
              key={a.id}
              to={`/activities/${a.id}`}
              className="card flex items-center gap-4 transition-colors hover:border-primary-200 hover:bg-primary-50/30"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-primary-50 text-primary-600">
                <ActivityIcon type={a.type} size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{a.title}</p>
                <p className="text-sm text-stone-500">
                  {activityTypeLabel(a.type)} • {formatDateTime(a.started_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatKm(a.distance_meters)} km</p>
                <p className="text-sm text-stone-500">{formatDuration(a.moving_seconds)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center text-stone-500">Tidak ada aktivitas.</div>
      )}

      {showManual && <ManualModal onClose={() => setShowManual(false)} />}
    </div>
  )
}
