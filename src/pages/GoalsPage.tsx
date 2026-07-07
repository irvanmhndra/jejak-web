import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { activityTypeLabel, formatKm } from '../lib/format'
import { useCreateGoal, useDeleteGoal, useGoals } from '../lib/queries'
import type { Goal } from '../types'

export default function GoalsPage() {
  const goals = useGoals()
  const create = useCreateGoal()
  const del = useDeleteGoal()

  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly')
  const [type, setType] = useState('')
  const [km, setKm] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dist = parseFloat(km.replace(',', '.'))
    if (!(dist > 0)) return
    await create.mutateAsync({
      period,
      activity_type: type || undefined,
      target_meters: dist * 1000,
    })
    setKm('')
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Target</h1>

      <form onSubmit={submit} className="card flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[120px]">
          <span className="mb-1.5 block text-sm font-semibold text-stone-700">Periode</span>
          <select className="input" value={period} onChange={(e) => setPeriod(e.target.value as 'weekly' | 'monthly')}>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
          </select>
        </label>
        <label className="flex-1 min-w-[120px]">
          <span className="mb-1.5 block text-sm font-semibold text-stone-700">Tipe</span>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Semua</option>
            <option value="run">Lari</option>
            <option value="ride">Bersepeda</option>
            <option value="walk">Jalan</option>
            <option value="hike">Hiking</option>
          </select>
        </label>
        <label className="flex-1 min-w-[120px]">
          <span className="mb-1.5 block text-sm font-semibold text-stone-700">Target (km)</span>
          <input className="input" inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value)} placeholder="20" />
        </label>
        <button
          type="submit"
          disabled={create.isPending}
          className="flex h-[42px] items-center gap-2 rounded-lg bg-primary-500 px-4 font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
        >
          <Plus size={16} /> Tambah
        </button>
      </form>

      {goals.isLoading ? (
        <p className="text-stone-500">Memuat…</p>
      ) : goals.data && goals.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.data.map((g) => (
            <GoalCard key={g.id} goal={g} onDelete={() => del.mutate(g.id)} />
          ))}
        </div>
      ) : (
        <div className="card text-center text-stone-500">Belum ada target. Tambah target di atas.</div>
      )}
    </div>
  )
}

function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: () => void }) {
  const pct = Math.min(100, (goal.current_meters / goal.target_meters) * 100)
  const done = pct >= 100
  return (
    <div className="card">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="font-bold">
            {goal.period === 'weekly' ? 'Mingguan' : 'Bulanan'}
            {goal.activity_type ? ` · ${activityTypeLabel(goal.activity_type)}` : ''}
          </p>
          <p className="text-sm text-stone-500">
            {formatKm(goal.current_meters)} / {formatKm(goal.target_meters)} km
          </p>
        </div>
        <button onClick={onDelete} className="text-stone-400 hover:text-red-600">
          <Trash2 size={18} />
        </button>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-stone-100">
        <div
          className={`h-3 rounded-full ${done ? 'bg-green-500' : 'bg-primary-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`mt-2 text-sm font-semibold ${done ? 'text-green-600' : 'text-stone-500'}`}>
        {done ? '🎉 Tercapai!' : `${Math.round(pct)}%`}
      </p>
    </div>
  )
}
