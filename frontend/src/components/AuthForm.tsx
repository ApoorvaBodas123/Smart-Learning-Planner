import { useState } from 'react'
import axios from 'axios'
import { UserPlus, Mail, Lock, User, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AuthFormProps {
  onLoginSuccess: (userData: any) => void;
}

export const AuthForm = ({ onLoginSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const endpoint = isLogin ? '/login/' : '/users/'
      const response = await axios.post(`http://127.0.0.1:8000${endpoint}`, formData)
      
      if (isLogin) {
        onLoginSuccess(response.data)
      } else {
        setStatus('success')
        setTimeout(() => { setIsLogin(true); setStatus('idle'); }, 2000)
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <motion.div 
      layout 
      className="card w-full max-w-md p-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
          {isLogin ? 'Sign in' : 'Create account'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div 
              key="username"
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <input 
                  type="text" required
                  className="input-field with-icon"
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Your Name"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
            <input 
              type="email" required
              className="input-field with-icon"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="name@university.edu"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
            <input 
              type="password" required
              className="input-field with-icon"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-4 text-sm tracking-wide disabled:opacity-50">
          {status === 'loading' ? "Processing..." : (isLogin ? "LOGIN" : "CREATE ACCOUNT")}
        </button>
        
        <p className="text-center text-sm font-bold text-slate-400 mt-6">
          {isLogin ? "New here?" : "Already have an account?"}
          <button type="button" onClick={() => setIsLogin(!isLogin) } className="text-primary ml-2 hover:underline">
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>

        {status === "error" && (
             <p className="text-red-600 text-xs font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100">
              {isLogin ? "Invalid credentials. Please try again." : "Registration failed. Email might already be in use."}
            </p>
        )}
      </form>
    </motion.div>
  )
}
