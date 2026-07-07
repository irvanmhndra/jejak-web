import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ActivitiesPage from './pages/ActivitiesPage'
import ActivityDetailPage from './pages/ActivityDetailPage'
import GoalsPage from './pages/GoalsPage'
import HeatmapPage from './pages/HeatmapPage'
import StatsPage from './pages/StatsPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
})

function Protected({ children }: { children: ReactNode }) {
  const authed = useAuthStore((s) => s.isAuthenticated)
  return authed ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <Protected>
                <AppLayout />
              </Protected>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:id" element={<ActivityDetailPage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
