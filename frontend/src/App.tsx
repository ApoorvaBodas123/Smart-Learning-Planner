import { useState, useEffect } from 'react'
import { AuthForm } from './components/AuthForm'
import { Dashboard } from './components/Dashboard'
import axios from 'axios'

function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [user])

  const handleLogin = (userData: any) => {
    setUser(userData.user)
    localStorage.setItem('user', JSON.stringify(userData.user))
    localStorage.setItem('token', userData.access_token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.access_token}`
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <div className="min-h-screen">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <AuthForm onLoginSuccess={handleLogin} />
        </div>
      )}
    </div>
  )
}

export default App
