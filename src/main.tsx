import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import Bar from './Bar.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Bar />
    <App />
  </StrictMode>,
)
