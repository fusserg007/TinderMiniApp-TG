import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, X, Star, User, MessageCircle, CreditCard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useApi } from '../contexts/ApiContext'
import LoadingSpinner from './LoadingSpinner'

interface Recommendation {
  id: string
  name: string
  age: number
  bio: string
  photos: string[]
  distance: number
}

function MainPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  
  const { user } = useAuth()
  const api = useApi()
  const navigate = useNavigate()

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/recommendations')
      if (response.data.success) {
        setRecommendations(response.data.data)
        setCurrentIndex(0)
      }
    } catch (err: any) {
      setError('Ошибка загрузки рекомендаций')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'like' | 'dislike' | 'superlike') => {
    if (actionLoading || currentIndex >= recommendations.length) return
    
    try {
      setActionLoading(true)
      const targetUser = recommendations[currentIndex]
      
      await api.post('/api/fire', {
        targetUserId: targetUser.id,
        action
      })
      
      // Move to next recommendation
      if (currentIndex < recommendations.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Load more recommendations
        await loadRecommendations()
      }
    } catch (err: any) {
      setError('Ошибка при оценке пользователя')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const currentUser = recommendations[currentIndex]

  return (
    <div className="container">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid var(--tg-theme-hint-color, #eee)',
        marginBottom: '16px'
      }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>TinderMiniApp</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="button-secondary" 
            onClick={() => navigate('/matches')}
            style={{ padding: '8px', width: 'auto' }}
          >
            <MessageCircle size={20} />
          </button>
          <button 
            className="button-secondary" 
            onClick={() => navigate('/profile')}
            style={{ padding: '8px', width: 'auto' }}
          >
            <User size={20} />
          </button>
          <button 
            className="button-secondary" 
            onClick={() => navigate('/payments')}
            style={{ padding: '8px', width: 'auto' }}
          >
            <CreditCard size={20} />
          </button>
        </div>
      </div>

      {/* User scores */}
      {user && (
        <div className="scores-info">
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{user.scores.likes}</div>
              <div className="text-small">Лайков</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{user.scores.superlikes}</div>
              <div className="text-small">Суперлайков</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{user.isPremium ? 'Premium' : 'Free'}</div>
              <div className="text-small">Статус</div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error">
          {error}
          <button 
            onClick={() => setError('')} 
            style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'white' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main content */}
      {!currentUser ? (
        <div className="text-center" style={{ padding: '40px 0' }}>
          <h3>Нет новых рекомендаций</h3>
          <p className="text-small">Попробуйте позже или расширьте настройки поиска</p>
          <button className="button" onClick={loadRecommendations}>
            Обновить
          </button>
        </div>
      ) : (
        <div>
          {/* User card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {currentUser.photos.length > 0 && (
              <img 
                src={currentUser.photos[0]} 
                alt={currentUser.name}
                className="profile-photo"
                style={{ margin: 0, borderRadius: '12px 12px 0 0' }}
              />
            )}
            
            <div style={{ padding: '16px' }}>
              <div className="profile-info">
                <div className="profile-name">
                  {currentUser.name}, {currentUser.age}
                </div>
                <div className="profile-details">
                  📍 {currentUser.distance} км от вас
                </div>
                {currentUser.bio && (
                  <p style={{ marginTop: '12px', textAlign: 'left' }}>
                    {currentUser.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="action-buttons">
            <button 
              className="action-button dislike-button"
              onClick={() => handleAction('dislike')}
              disabled={actionLoading}
            >
              <X size={24} />
            </button>
            
            <button 
              className="action-button"
              onClick={() => handleAction('superlike')}
              disabled={actionLoading}
              style={{ background: '#007aff' }}
            >
              <Star size={24} />
            </button>
            
            <button 
              className="action-button like-button"
              onClick={() => handleAction('like')}
              disabled={actionLoading}
            >
              <Heart size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainPage
