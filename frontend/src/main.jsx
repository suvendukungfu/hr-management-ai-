import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MissionControlProvider } from './hooks/MissionControlProvider.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MissionControlProvider>
      <App />
    </MissionControlProvider>
  </StrictMode>,
)
