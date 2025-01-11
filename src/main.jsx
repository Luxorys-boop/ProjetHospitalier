import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppShifts from './composantsShifts/AppShifts.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <AppShifts />
  </StrictMode>,
)
