import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../config/api'
import type { Activity, ActivityDetail, PersonalRecord, StatsSummary } from '../types'

export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async (): Promise<Activity[]> => {
      const res = await api.get('/activities', { params: { limit: 100 } })
      return res.data.data
    },
  })
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: async (): Promise<ActivityDetail> => {
      const res = await api.get(`/activities/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async (): Promise<StatsSummary> => {
      const res = await api.get('/stats/summary')
      return res.data.data
    },
  })
}

export function useRecords() {
  return useQuery({
    queryKey: ['records'],
    queryFn: async (): Promise<PersonalRecord[]> => {
      const res = await api.get('/records')
      return res.data.data
    },
  })
}

function useInvalidateAll() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['activities'] })
    qc.invalidateQueries({ queryKey: ['stats'] })
    qc.invalidateQueries({ queryKey: ['records'] })
  }
}

export function useDeleteActivity() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/activities/${id}`),
    onSuccess: invalidate,
  })
}

export interface ManualInput {
  type: string
  title?: string
  started_at: string
  elapsed_seconds: number
  distance_meters: number
}

export function useCreateManual() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: (input: ManualInput) => api.post('/activities/manual', input),
    onSuccess: invalidate,
  })
}

export function useImportGPX() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return api.post('/activities/import', form)
    },
    onSuccess: invalidate,
  })
}

/** Downloads an activity's GPX via the authenticated API and saves it. */
export async function downloadGPX(id: string, title: string) {
  const res = await api.get(`/activities/${id}/gpx`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'activity'}.gpx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
