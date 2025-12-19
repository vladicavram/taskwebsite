'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error)
    console.error('Error info:', errorInfo)
    console.error('Component stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div style={{ 
          padding: '20px', 
          background: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h3 style={{ color: '#c00', margin: '0 0 10px 0' }}>Component Error</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {this.state.error?.message || 'An error occurred'}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
