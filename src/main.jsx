import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/storage.js'
import App from './App.jsx'
import { PaginaResponder } from './telas/responder.jsx'

const publica = window.location.pathname.replace(/\/$/, '') === '/responder'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {publica ? <PaginaResponder /> : <App />}
  </StrictMode>,
)
