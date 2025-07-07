import React from 'react'

function LoadingSpinner() {
  return (
    <div className="loading">
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid var(--tg-theme-hint-color, #f3f3f3)',
        borderTop: '4px solid var(--tg-theme-button-color, #007aff)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LoadingSpinner
