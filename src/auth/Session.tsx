import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchMe,
  getStudentByUid,
  loginRequest,
  logoutLocal,
  registerRequest,
  subscribe,
} from '../data/store'
import type { Role, Student, User } from '../data/types'

interface SessionState {
  user: User | null
  student: Student | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
  register: (input: {
    full_name: string
    email: string
    password: string
    phone: string
    address: string
    emergency_contact: string
    preferred_language: string
  }) => Promise<string | null>
  refresh: () => Promise<void>
}

const SessionContext = createContext<SessionState | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    return subscribe(() => setTick((t) => t + 1))
  }, [])

  useEffect(() => {
    void tick
    if (user?.role === 'student') {
      setStudent(getStudentByUid(user.uid))
    }
  }, [tick, user])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const me = await fetchMe()
      if (cancelled) return
      if (me) {
        setUser(me.user)
        setStudent(me.student)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await loginRequest(email, password)
      setUser(data.user)
      setStudent(data.student)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Login failed.'
    }
  }, [])

  const logout = useCallback(() => {
    logoutLocal()
    setUser(null)
    setStudent(null)
  }, [])

  const register = useCallback(
    async (input: {
      full_name: string
      email: string
      password: string
      phone: string
      address: string
      emergency_contact: string
      preferred_language: string
    }) => {
      try {
        const data = await registerRequest(input)
        setUser(data.user)
        setStudent(data.student)
        return null
      } catch (e) {
        return e instanceof Error ? e.message : 'Registration failed.'
      }
    },
    [],
  )

  const refresh = useCallback(async () => {
    const me = await fetchMe()
    if (me) {
      setUser(me.user)
      setStudent(me.student)
    }
  }, [])

  const value = useMemo(
    () => ({ user, student, loading, login, logout, register, refresh }),
    [user, student, loading, login, logout, register, refresh],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}

export function homeForRole(role: Role, studentStatus?: string | null) {
  if (role === 'student' && studentStatus && studentStatus !== 'approved') {
    return '/app/student/registration'
  }
  switch (role) {
    case 'student':
      return '/app/student'
    case 'instructor':
      return '/app/instructor'
    case 'admin':
      return '/app/admin'
  }
}
