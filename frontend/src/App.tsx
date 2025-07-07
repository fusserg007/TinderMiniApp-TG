import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { WebApp } from '@telegram-apps/sdk'
import AuthPage from './components/AuthPage'
import MainPage from './components/MainPage'
import ProfilePage from './components/ProfilePage'
import MatchesPage from './components/MatchesPage'
import PaymentsPage from './components/PaymentsPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ApiProvider } from './contexts/ApiContext'
import LoadingSpinner from './components/LoadingSpinner'

function AppContent() {
  const { user, loading } = useAuth()
  const [webAppReady, setWebAppReady] = useState(false)

  useEffect(() => {
    try {
      WebApp.ready()
      WebApp.expand()
      setWebAppReady(true)
    } catch (error) {
      console.error('WebApp initialization error:', error)
      setWebAppReady(true) // Continue anyway for development
    }
  }, [])

  if (!webAppReady || loading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/" replace /> : <AuthPage />} 
        />
        <Route 
          path="/" 
          element={user ? <MainPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/profile" 
          element={user ? <ProfilePage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/matches" 
          element={user ? <MatchesPage /> : <Navigate to="/auth" replace />} 
        />
        <Route 
          path="/payments" 
          element={user ? <PaymentsPage /> : <Navigate to="/auth" replace />} 
        />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <ApiProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ApiProvider>
  )
}

export default App
