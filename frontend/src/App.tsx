import { useState } from 'react'
import { AuthForm } from './components/AuthForm'
import { Dashboard } from './components/Dashboard'

function App() {
  const [user, setUser] = useState<any>(null)

  return (
    <div className="min-h-screen">
      {user ? (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      ) : (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <AuthForm onLoginSuccess={(user) => setUser(user)} />
        </div>
      )}
    </div>
  )
}

export default App
