import { Activity, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)

  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) await register(name, email, password)
      else await login(email, password)
      navigate('/')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Terjadi kesalahan. Coba lagi.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-500 text-white">
            <Activity size={24} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Jejak</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-card">
          <h1 className="text-2xl font-extrabold">
            {isRegister ? 'Buat Akun' : 'Selamat Datang'}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {isRegister ? 'Daftar untuk mulai melacak aktivitas.' : 'Masuk ke dashboard Jejak-mu.'}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {isRegister && (
              <Field label="Nama">
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Kata Sandi">
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 font-bold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
            >
              {loading ? 'Memproses…' : isRegister ? 'Daftar' : 'Masuk'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <button
            onClick={() => setIsRegister((v) => !v)}
            className="mt-4 w-full text-center text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-stone-700">{label}</span>
      {children}
    </label>
  )
}
