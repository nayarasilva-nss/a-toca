import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/storage.js'
import App from './App.jsx'
import { PaginaResponder } from './telas/responder.jsx'
import { PaginaAplicar } from './telas/aplicar.jsx'

const caminho = window.location.pathname.replace(/\/$/, '')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {caminho === '/responder' ? <PaginaResponder /> : caminho === '/aplicar' ? <PaginaAplicar /> : <App />}
  </StrictMode>,
)
