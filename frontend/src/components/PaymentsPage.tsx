import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Zap, Crown, CreditCard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useApi } from '../contexts/ApiContext'
import LoadingSpinner from './LoadingSpinner'

interface PaymentHistory {
  id: string
  amount: number
  currency: string
  description: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

function PaymentsPage() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { user, updateUser } = useAuth()
  const api = useApi()
  const navigate = useNavigate()

  useEffect(() => {
    loadPaymentHistory()
  }, [])

  const loadPaymentHistory = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/payments/history')
      if (response.data.success) {
        setPaymentHistory(response.data.data)
      }
    } catch (err: any) {
      setError('Ошибка загрузки истории платежей')
    } finally {
      setLoading(false)
    }
  }

  const createPayment = async (productId: string, amount: number, description: string) => {
    try {
      setPaymentLoading(productId)
      setError('')
      setSuccess('')
      
      const response = await api.post('/api/payments/create', {
        amount,
        currency: 'XTR', // Telegram Stars
        description
      })
      
      if (response.data.success) {
        const { invoiceLink } = response.data.data
        
        // Open Telegram payment
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.openInvoice(invoiceLink, (status: string) => {
            if (status === 'paid') {
              setSuccess('Платеж успешно выполнен!')
              loadPaymentHistory()
              // Update user premium status if needed
              if (productId === 'premium') {
                updateUser({ isPremium: true })
              }
            } else if (status === 'cancelled') {
              setError('Платеж отменен')
            } else {
              setError('Ошибка платежа')
            }
          })
        } else {
          // Fallback for development
          setSuccess('Платеж инициирован (режим разработки)')
        }
      }
    } catch (err: any) {
      setError('Ошибка создания платежа')
    } finally {
      setPaymentLoading('')
    }
  }

  const products = [
    {
      id: 'superlikes_5',
      title: '5 Суперлайков',
      description: 'Покажите особый интерес',
      price: 50,
      icon: <Star size={24} color="#007aff" />
    },
    {
      id: 'superlikes_20',
      title: '20 Суперлайков',
      description: 'Больше возможностей для знакомств',
      price: 180,
      icon: <Zap size={24} color="#ff9500" />
    },
    {
      id: 'premium',
      title: 'Premium на месяц',
      description: 'Безлимитные лайки, просмотр кто лайкнул, приоритет в показе',
      price: 500,
      icon: <Crown size={24} color="#ff3b30" />
    }
  ]

  if (loading) {
    return <LoadingSpinner />
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
        <h1 style={{ fontSize: '24px', margin: 0 }}>Покупки</h1>
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

      {success && (
        <div className="success">
          {success}
          <button 
            onClick={() => setSuccess('')} 
            style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'white' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Current Status */}
      {user && (
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Текущий статус</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {user.isPremium ? '👑 Premium' : '🆓 Бесплатный'}
              </div>
              <div className="text-small">
                Суперлайков: {user.scores.superlikes}
              </div>
            </div>
            {user.isPremium && (
              <div className="text-small" style={{ color: 'var(--tg-theme-button-color, #007aff)' }}>
                Активен
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Доступные покупки</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.map((product) => (
            <div 
              key={product.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                background: 'var(--tg-theme-secondary-bg-color, #f8f9fa)',
                borderRadius: '8px',
                border: '1px solid var(--tg-theme-hint-color, #eee)'
              }}
            >
              <div style={{ marginRight: '12px' }}>
                {product.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {product.title}
                </div>
                <div className="text-small">
                  {product.description}
                </div>
              </div>
              <div style={{ textAlign: 'right', marginRight: '12px' }}>
                <div style={{ fontWeight: 'bold' }}>
                  ⭐ {product.price}
                </div>
                <div className="text-small">Telegram Stars</div>
              </div>
              <button 
                className="button"
                onClick={() => createPayment(product.id, product.price, product.title)}
                disabled={paymentLoading === product.id}
                style={{ width: 'auto', padding: '8px 16px', margin: 0 }}
              >
                {paymentLoading === product.id ? '...' : 'Купить'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>История покупок</h3>
        {paymentHistory.length === 0 ? (
          <div className="text-center" style={{ padding: '20px 0' }}>
            <CreditCard size={48} color="var(--tg-theme-hint-color, #999)" style={{ marginBottom: '16px' }} />
            <p className="text-small">Пока нет покупок</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {paymentHistory.map((payment) => (
              <div 
                key={payment.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'var(--tg-theme-bg-color, #fff)',
                  borderRadius: '6px',
                  border: '1px solid var(--tg-theme-hint-color, #eee)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {payment.description}
                  </div>
                  <div className="text-small">
                    {new Date(payment.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>
                    ⭐ {payment.amount}
                  </div>
                  <div 
                    className="text-small"
                    style={{
                      color: payment.status === 'completed' ? '#34c759' : 
                             payment.status === 'failed' ? '#ff3b30' : '#ff9500'
                    }}
                  >
                    {payment.status === 'completed' ? 'Выполнен' :
                     payment.status === 'failed' ? 'Ошибка' : 'В обработке'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>ℹ️ Информация</h3>
        <div className="text-small" style={{ lineHeight: '1.5' }}>
          • Платежи обрабатываются через Telegram Stars<br/>
          • Все покупки мгновенно зачисляются на аккаунт<br/>
          • Premium подписка действует 30 дней<br/>
          • Возврат средств согласно правилам Telegram
        </div>
      </div>
    </div>
  )
}

export default PaymentsPage
