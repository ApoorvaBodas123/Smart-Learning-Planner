import { useState } from 'react'
import axios from 'axios'
import { UserPlus, Mail, Lock, User, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { p } from 'framer-motion/client';

interface AuthFormProps {
  onLoginSuccess: (user: any) => void;
}

export const AuthForm = ({ onLoginSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(false)
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const endpoint = isLogin ? '/login/' : '/users/'
      const response = await axios.post(`http://127.0.0.1:8000${endpoint}`, formData)
      
      if (isLogin) {
        onLoginSuccess(response.data.user)
      } else {
        setStatus('success')
        setTimeout(() => { setIsLogin(true); setStatus('idle'); }, 2000)
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <motion.div layout className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4">
          {isLogin ? <LogIn className="text-blue-500 w-8 h-8" /> : <UserPlus className="text-blue-500 w-8 h-8" />}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{isLogin ? "Welcome Back" : "Create Account"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="text" required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input 
              type="email" required
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input 
              type="password" required
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <button type="submit" disabled={status === 'loading'} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-semibold transition-colors mt-6 disabled:opacity-50">
          {status === 'loading' ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
        </button>
        
        <p className="text-center text-slate-400 mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button type="button" onClick={() => setIsLogin(!isLogin) } className="text-blue-500 ml-2 hover:underline">
            {isLogin ? "Sign Up" : "Log In"}

          </button>
        </p>
        {status === "error" && (
             <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
              {isLogin ? "Account not found or password incorrect." : "Could not create account. Try a different email."}
            </p>
        )}
      </form>
    </motion.div>
  )
}
