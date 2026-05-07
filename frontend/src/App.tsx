import { useState } from 'react'
import { AuthForm } from './components/AuthForm'
import { Dashboard } from './components/Dashboard'

function App() {
  const [user, setUser] = useState<any>(null)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      {user ? (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      ) : (
        <AuthForm onLoginSuccess={(user) => setUser(user)} />
      )}
    </div>
  )
}

export default App
