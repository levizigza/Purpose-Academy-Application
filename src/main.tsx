import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { BRAND_ASSETS } from './brand/assets'
import './styles.css'

document.documentElement.style.setProperty(
  '--asset-threshold',
  `url(${JSON.stringify(BRAND_ASSETS.threshold)})`,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
