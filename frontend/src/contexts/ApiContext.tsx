import React, { createContext, useContext, ReactNode } from 'react'
import axios, { AxiosInstance } from 'axios'

const ApiContext = createContext<AxiosInstance | undefined>(undefined)

export function ApiProvider({ children }: { children: ReactNode }) {
  const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:8080',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Request interceptor to add auth headers
  api.interceptors.request.use(
    (config) => {
      // Add any auth tokens here if needed
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        window.location.href = '/auth'
      }
      return Promise.reject(error)
    }
  )

  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  )
}

export function useApi() {
  const context = useContext(ApiContext)
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}
