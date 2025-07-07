import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Heart } from 'lucide-react'
import { useApi } from '../contexts/ApiContext'
import LoadingSpinner from './LoadingSpinner'

interface Match {
  id: string
  user: {
    id: string
    name: string
    photos: string[]
  }
  createdAt: string
  lastMessage?: {
    text: string
    createdAt: string
  }
}

interface Message {
  id: string
  text: string
  senderId: string
  createdAt: string
}

function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState('')
  
  const api = useApi()
  const navigate = useNavigate()

  useEffect(() => {
    loadMatches()
  }, [])

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch.id)
    }
  }, [selectedMatch])

  const loadMatches = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/matches')
      if (response.data.success) {
        setMatches(response.data.data)
      }
    } catch (err: any) {
      setError('Ошибка загрузки матчей')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (matchId: string) => {
    try {
      const response = await api.get(`/api/matches/${matchId}/messages`)
      if (response.data.success) {
        setMessages(response.data.data)
      }
    } catch (err: any) {
      setError('Ошибка загрузки сообщений')
    }
  }

  const sendMessage = async () => {
    if (!selectedMatch || !newMessage.trim() || sendingMessage) return
    
    try {
      setSendingMessage(true)
      const response = await api.post(`/api/matches/${selectedMatch.id}/messages`, {
        text: newMessage.trim()
      })
      
      if (response.data.success) {
        setMessages([...messages, response.data.data])
        setNewMessage('')
      }
    } catch (err: any) {
      setError('Ошибка отправки сообщения')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '16px 0',
        borderBottom: '1px solid var(--tg-theme-hint-color, #eee)',
        flexShrink: 0
      }}>
        {selectedMatch ? (
          <>
            <button 
              onClick={() => setSelectedMatch(null)}
              style={{ background: 'none', border: 'none', padding: '8px', marginRight: '12px' }}
            >
              <ArrowLeft size={24} />
            </button>
            <img 
              src={selectedMatch.user.photos[0]} 
              alt={selectedMatch.user.name}
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '20px', 
                objectFit: 'cover',
                marginRight: '12px'
              }}
            />
            <h1 style={{ fontSize: '20px', margin: 0 }}>{selectedMatch.user.name}</h1>
          </>
        ) : (
          <>
            <button 
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', padding: '8px', marginRight: '12px' }}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 style={{ fontSize: '24px', margin: 0 }}>Матчи</h1>
          </>
        )}
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

      {/* Content */}
      {!selectedMatch ? (
        // Matches list
        <div style={{ flex: 1, overflow: 'auto' }}>
          {matches.length === 0 ? (
            <div className="text-center" style={{ padding: '40px 0' }}>
              <Heart size={48} color="var(--tg-theme-hint-color, #999)" style={{ marginBottom: '16px' }} />
              <h3>Пока нет матчей</h3>
              <p className="text-small">Начните лайкать анкеты, чтобы найти совпадения!</p>
            </div>
          ) : (
            <div style={{ padding: '16px 0' }}>
              {matches.map((match) => (
                <div 
                  key={match.id}
                  className="match-item"
                  onClick={() => setSelectedMatch(match)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={match.user.photos[0]} 
                    alt={match.user.name}
                    className="match-photo"
                  />
                  <div className="match-info">
                    <div className="match-name">{match.user.name}</div>
                    <div className="match-message">
                      {match.lastMessage ? match.lastMessage.text : 'Новый матч! 💕'}
                    </div>
                  </div>
                  <MessageCircle size={20} color="var(--tg-theme-hint-color, #999)" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Chat view
        <>
          {/* Messages */}
          <div style={{ 
            flex: 1, 
            overflow: 'auto', 
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {messages.length === 0 ? (
              <div className="text-center" style={{ padding: '40px 0' }}>
                <p className="text-small">Начните общение! Напишите первое сообщение.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id}
                  style={{
                    alignSelf: message.senderId === selectedMatch.user.id ? 'flex-start' : 'flex-end',
                    background: message.senderId === selectedMatch.user.id 
                      ? 'var(--tg-theme-secondary-bg-color, #f0f0f0)' 
                      : 'var(--tg-theme-button-color, #007aff)',
                    color: message.senderId === selectedMatch.user.id 
                      ? 'var(--tg-theme-text-color, #000)' 
                      : 'var(--tg-theme-button-text-color, #fff)',
                    padding: '8px 12px',
                    borderRadius: '16px',
                    marginBottom: '8px',
                    maxWidth: '70%',
                    wordWrap: 'break-word'
                  }}
                >
                  {message.text}
                </div>
              ))
            )}
          </div>

          {/* Message input */}
          <div style={{ 
            padding: '16px 0',
            borderTop: '1px solid var(--tg-theme-hint-color, #eee)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                className="input"
                placeholder="Напишите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ margin: 0, flex: 1 }}
                disabled={sendingMessage}
              />
              <button 
                className="button"
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                style={{ width: 'auto', padding: '12px 16px', margin: 0 }}
              >
                {sendingMessage ? '...' : '→'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MatchesPage
