import { X } from 'lucide-react'
import { useState } from 'react'
import { activityTypeLabel } from '../lib/format'
import { useCreateManual } from '../lib/queries'

const TYPES = ['run', 'ride', 'walk', 'hike'] as const

function nowLocalInput(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default function ManualModal({ onClose }: { onClose: () => void }) {
  const create = useCreateManual()
  const [type, setType] = useState<string>('run')
  const [title, setTitle] = useState('')
  const [startedAt, setStartedAt] = useState(nowLocalInput())
  const [km, setKm] = useState('')
  const [minutes, setMinutes] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const distance = parseFloat(km.replace(',', '.'))
    const mins = parseInt(minutes, 10)
    if (!(distance > 0) || !(mins > 0)) {
      setError('Isi jarak dan durasi.')
      return
    }
    try {
      await create.mutateAsync({
        type,
        title: title.trim() || undefined,
        started_at: new Date(startedAt).toISOString(),
        elapsed_seconds: mins * 60,
        distance_meters: distance * 1000,
      })
      onClose()
    } catch {
      setError('Gagal menyimpan.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Input Manual</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                  type === t ? 'bg-primary-500 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {activityTypeLabel(t)}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-stone-700">Judul (opsional)</span>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-stone-700">Tanggal & Waktu</span>
            <input
              type="datetime-local"
              className="input"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-stone-700">Jarak (km)</span>
              <input
                className="input"
                inputMode="decimal"
                value={km}
                onChange={(e) => setKm(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-stone-700">Durasi (menit)</span>
              <input
                className="input"
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={create.isPending}
            className="w-full rounded-lg bg-primary-500 py-3 font-bold text-white hover:bg-primary-600 disabled:opacity-60"
          >
            {create.isPending ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  )
}
