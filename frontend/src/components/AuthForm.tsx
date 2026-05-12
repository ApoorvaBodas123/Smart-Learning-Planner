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
    <motion.div 
      layout 
      className="card w-full max-w-md shadow-2xl p-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
          <div className="w-8 h-8 bg-green-600 rounded-lg rotate-45 flex items-center justify-center">
             <div className="w-4 h-4 bg-white/30 rounded-sm -rotate-45" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{isLogin ? "Sign in" : "Create account"}</h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">Smart Learning Planner v1.0</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
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
          <button type="button" onClick={() => setIsLogin(!isLogin) } className="text-green-600 ml-2 hover:underline">
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
  
