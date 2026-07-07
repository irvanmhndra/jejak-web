import { Activity, BarChart3, LayoutDashboard, LogOut, Map } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/activities', label: 'Aktivitas', icon: Activity, end: false },
  { to: '/heatmap', label: 'Heatmap', icon: Map, end: false },
  { to: '/stats', label: 'Statistik', icon: BarChart3, end: false },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <aside className="fixed inset-y-0 left-0 w-60 border-r border-stone-200 bg-white px-4 py-6 flex flex-col">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-500 text-white">
            <Activity size={20} />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Jejak</span>
        </div>

        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-stone-200 pt-4">
          <div className="px-3 mb-2">
            <p className="text-sm font-semibold text-stone-900 truncate">{user?.name}</p>
            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      <main className="ml-60 p-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
