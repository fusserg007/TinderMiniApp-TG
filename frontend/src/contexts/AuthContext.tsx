import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useApi } from './ApiContext'

interface User {
  id: string
  name: string
  age: number
  bio: string
  photos: string[]
  location: {
    latitude: number
    longitude: number
  }
  preferences: {
    minAge: number
    maxAge: number
    maxDistance: number
  }
  scores: {
    likes: number
    superlikes: number
  }
  isPremium: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (initData: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const api = useApi()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/auth/me')
      if (response.data.success) {
        setUser(response.data.data)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (initData: string) => {
    try {
      setLoading(true)
      const response = await api.post('/api/auth/login', { initData })
      if (response.data.success) {
        setUser(response.data.data)
      } else {
        throw new Error(response.data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    // Clear any stored tokens or session data
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
