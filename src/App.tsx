import { useState, useEffect } from 'react'
import Login from './components/Login'
import Home from './components/Home'
import { registerUnauthorizedHandler } from './lib/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('auth_token')
  })

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setIsAuthenticated(false)
  }

  // Registra callback para quando a API retornar 401
  // (evita o window.location.reload() que causava tela branca)
  useEffect(() => {
    registerUnauthorizedHandler(handleLogout)
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  return (
    <div className="app-main">
      {isAuthenticated ? (
        <Home onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  )
}

export default App
