import React, { useState, useEffect } from 'react'
import { WebApp } from '@telegram-apps/sdk'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  useEffect(() => {
    // Auto-login if we have Telegram WebApp data
    if (WebApp.initData) {
      handleLogin()
    }
  }, [])

  const handleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      
      const initData = WebApp.initData || 'demo_data'
      await login(initData)
    } catch (err: any) {
      setError(err.message || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container" style={{ padding: '40px 16px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '28px' }}>TinderMiniApp</h1>
      <p style={{ marginBottom: '32px', color: 'var(--tg-theme-hint-color, #999)' }}>
        Добро пожаловать! Найдите свою вторую половинку прямо в Telegram.
      </p>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      <button 
        className="button" 
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Вход...' : 'Войти через Telegram'}
      </button>
      
      <p className="text-small" style={{ marginTop: '16px' }}>
        Нажимая "Войти", вы соглашаетесь с условиями использования
      </p>
    </div>
  )
}

export default AuthPage
