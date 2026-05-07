import { CheckCircle2, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-12 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl">
      <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
      <h1 className="text-4xl font-bold">Welcome, {user.username}!</h1>
      <p className="text-slate-400 mt-4 text-xl">You are successfully logged in.</p>
      <button 
        onClick={onLogout}
        className="mt-8 flex items-center mx-auto gap-2 px-8 py-3 bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all font-medium border border-transparent hover:border-red-500/50"
      >
        <LogOut size={18} /> Logout
      </button>
    </motion.div>
  )
}
