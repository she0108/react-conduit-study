import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './styles/global.css'
import App from './App.jsx'
import AuthProvider from './contexts/AuthProvider.jsx'
import { worker } from './mocks/browser.js'

// 모의 API가 준비된 뒤에 앱을 렌더링한다.
worker.start({ onUnhandledRequest: 'bypass' }).then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  )
})
