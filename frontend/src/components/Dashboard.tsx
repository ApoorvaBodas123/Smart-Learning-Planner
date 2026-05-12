import { CheckCircle2, LogOut, Calendar, Link as LinkIcon, Activity, Sun, MoreHorizontal, Settings, HelpCircle, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { SubjectManager } from './SubjectManager'
import { SmartSchedule } from './SmartSchedule'

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  return (
    <div className="app-container">
      {/* Sidebar - Professional SaaS Navigation */}
      <aside className="sidebar">
        <div className="flex items-center gap-3 px-6 mb-10">
           <div className="w-8 h-8 bg-green-400 rounded-lg rotate-45 flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-sm -rotate-45" />
           </div>
           <span className="text-white font-black tracking-tighter text-lg">PLANNER</span>
        </div>

        <nav className="flex flex-col gap-4 w-full px-4">
          <div className="flex items-center gap-4 px-4 py-3.5 text-white bg-white/10 rounded-xl cursor-pointer transition-all shadow-sm">
            <Calendar size={20} />
            <span className="text-sm font-bold tracking-wide">Schedule</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all group">
            <LinkIcon size={20} />
            <span className="text-sm font-bold tracking-wide">Curriculum</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all group">
            <Activity size={20} />
            <span className="text-sm font-bold tracking-wide">Insights</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all group">
            <Sun size={20} />
            <span className="text-sm font-bold tracking-wide">Focus Mode</span>
          </div>
        </nav>

        <div className="mt-auto w-full px-4 mb-8 space-y-2">
           <div className="flex items-center gap-4 px-4 py-3 text-white/40 hover:text-white cursor-pointer group">
              <Settings size={18} />
              <span className="text-xs font-bold">Settings</span>
           </div>
           <div className="flex items-center gap-4 px-4 py-3 text-white/40 hover:text-white cursor-pointer group">
              <HelpCircle size={18} />
              <span className="text-xs font-bold">Support</span>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Wednesday, May 12</h1>
            <p className="text-slate-500 font-medium mt-1">Welcome back, {user.username}. Let's optimize your study day.</p>
          </div>
          
          <div className="flex items-center gap-4">
             <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 font-semibold transition-all text-sm"
            >
              <LogOut size={18} /> Logout
            </button>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${user.username}&background=00592d&color=fff`} alt="User" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12">
          <SmartSchedule userId={user.id} />
          <SubjectManager userId={user.id} />
        </div>
      </main>
    </div>
  )
}
