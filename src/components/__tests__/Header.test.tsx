import React from 'react'
import { render, screen } from '@testing-library/react'
import Header from '../Header'

test('renders site title', () => {
  render(<Header />)
  expect(screen.getByText(/TaskSite/i)).toBeInTheDocument()
})
