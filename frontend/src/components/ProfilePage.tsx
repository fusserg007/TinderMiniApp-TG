import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useApi } from '../contexts/ApiContext'

function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const api = useApi()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || 18,
    bio: user?.bio || '',
    preferences: {
      minAge: user?.preferences.minAge || 18,
      maxAge: user?.preferences.maxAge || 50,
      maxDistance: user?.preferences.maxDistance || 50
    }
  })

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await api.put('/api/auth/profile', formData)
      if (response.data.success) {
        updateUser(response.data.data)
        setEditing(false)
      }
    } catch (err: any) {
      setError('Ошибка сохранения профиля')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('photo', file)
      
      const response = await api.post('/api/auth/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        updateUser({ photos: response.data.data.photos })
      }
    } catch (err: any) {
      setError('Ошибка загрузки фото')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '16px 0',
        borderBottom: '1px solid var(--tg-theme-hint-color, #eee)',
        marginBottom: '16px'
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', padding: '8px', marginRight: '12px' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '24px', margin: 0, flex: 1 }}>Профиль</h1>
        <button 
          onClick={() => setEditing(!editing)}
          style={{ background: 'none', border: 'none', padding: '8px' }}
        >
          <Settings size={24} />
        </button>
      </div>

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

      {/* Profile Photos */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Фотографии</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
          {user.photos.map((photo, index) => (
            <img 
              key={index}
              src={photo} 
              alt={`Фото ${index + 1}`}
              style={{ 
                width: '100%', 
                height: '120px', 
                objectFit: 'cover', 
                borderRadius: '8px' 
              }}
            />
          ))}
          
          {user.photos.length < 6 && (
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '120px',
              border: '2px dashed var(--tg-theme-hint-color, #ccc)',
              borderRadius: '8px',
              cursor: 'pointer',
              background: 'var(--tg-theme-secondary-bg-color, #f8f9fa)'
            }}>
              <Camera size={24} color="var(--tg-theme-hint-color, #999)" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                disabled={loading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Основная информация</h3>
        
        {editing ? (
          <div>
            <input 
              className="input"
              placeholder="Имя"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <input 
              className="input"
              type="number"
              placeholder="Возраст"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
            />
            
            <textarea 
              className="input"
              placeholder="О себе"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button 
                className="button"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button 
                className="button-secondary"
                onClick={() => setEditing(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="profile-details" style={{ textAlign: 'left', marginBottom: '8px' }}>
              <strong>Имя:</strong> {user.name}
            </div>
            <div className="profile-details" style={{ textAlign: 'left', marginBottom: '8px' }}>
              <strong>Возраст:</strong> {user.age} лет
            </div>
            <div className="profile-details" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <strong>О себе:</strong> {user.bio || 'Не указано'}
            </div>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Настройки поиска</h3>
        
        {editing ? (
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Возраст: {formData.preferences.minAge} - {formData.preferences.maxAge} лет</label>
            <input 
              type="range"
              min="18"
              max="80"
              value={formData.preferences.minAge}
              onChange={(e) => setFormData({
                ...formData,
                preferences: {
                  ...formData.preferences,
                  minAge: parseInt(e.target.value)
                }
              })}
              style={{ width: '100%', marginBottom: '12px' }}
            />
            <input 
              type="range"
              min="18"
              max="80"
              value={formData.preferences.maxAge}
              onChange={(e) => setFormData({
                ...formData,
                preferences: {
                  ...formData.preferences,
                  maxAge: parseInt(e.target.value)
                }
              })}
              style={{ width: '100%', marginBottom: '12px' }}
            />
            
            <label style={{ display: 'block', marginBottom: '8px' }}>Расстояние: до {formData.preferences.maxDistance} км</label>
            <input 
              type="range"
              min="1"
              max="100"
              value={formData.preferences.maxDistance}
              onChange={(e) => setFormData({
                ...formData,
                preferences: {
                  ...formData.preferences,
                  maxDistance: parseInt(e.target.value)
                }
              })}
              style={{ width: '100%', marginBottom: '12px' }}
            />
          </div>
        ) : (
          <div>
            <div className="profile-details" style={{ textAlign: 'left', marginBottom: '8px' }}>
              <strong>Возраст:</strong> {user.preferences.minAge} - {user.preferences.maxAge} лет
            </div>
            <div className="profile-details" style={{ textAlign: 'left', marginBottom: '8px' }}>
              <strong>Расстояние:</strong> до {user.preferences.maxDistance} км
            </div>
          </div>
        )}
      </div>

      {/* Account Actions */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Аккаунт</h3>
        <button 
          className="button"
          onClick={logout}
          style={{ background: '#ff3b30' }}
        >
          Выйти
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
