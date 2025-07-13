import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n'; // Import the i18next configuration

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Suspense fallback="Loading...">
      <App />
    </Suspense>
  </StrictMode>,
)
