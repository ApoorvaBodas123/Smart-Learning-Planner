import React, { useState } from 'react'
import {
  Calendar,
  Link as LinkIcon,
  Activity,
  Sun,
  Moon,
  Settings,
  HelpCircle,
  LogOut,
  Map
} from 'lucide-react'
import { format } from 'date-fns'
import { SubjectManager } from './SubjectManager'
import { SmartSchedule } from './SmartSchedule'
import { RoadmapGenerator } from './RoadmapGenerator'
import { Insights } from './Insights'
import { CalendarView } from './Calendar'

interface DashboardProps {
  user: any
  onLogout: () => void
}

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'insights' | 'roadmap' | 'calendar'>('schedule')
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="flex items-center gap-3 px-8 mb-12">
          <span className="text-slate-900 dark:text-white font-black tracking-tighter text-2xl uppercase">ROADMINT</span>
        </div>

        <nav className="flex flex-col w-full px-2">
          <div
            onClick={() => setActiveTab('schedule')}
            className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
          >
            <Calendar size={18} />
            <span className="tracking-tight">Schedule</span>
          </div>
          <div
            onClick={() => setActiveTab('roadmap')}
            className={`nav-item ${activeTab === 'roadmap' ? 'active' : ''}`}
          >
            <Map size={18} />
            <span className="tracking-tight">Roadmap</span>
          </div>
          <div
            onClick={() => setActiveTab('insights')}
            className={`nav-item ${activeTab === 'insights' ? 'active' : ''}`}
          >
            <Activity size={18} />
            <span className="tracking-tight">Insights</span>
          </div>
          <div
            onClick={() => setActiveTab('calendar')}
            className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          >
            <Calendar size={18} />
            <span className="tracking-tight">Calendar</span>
          </div>
        </nav>

        <div className="mt-auto w-full mb-8 space-y-1">
          <div
            onClick={toggleTheme}
            className="nav-item mode-toggle-btn rounded-xl"
          >
            {isDark ? <Sun size={18} className="mr-2" /> : <Moon size={18} className="mr-2" />}
            <span className="tracking-tight font-bold">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </div>

          <div
            onClick={onLogout}
            className="nav-item hover:text-red-500"
          >
            <LogOut size={18} className="mr-2" />
            <span className="tracking-tight">Logout</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="flex justify-between items-center mb-12">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeTab === 'schedule' && format(new Date(), 'EEEE, MMMM d')}
              {activeTab === 'roadmap' && 'AI Roadmaps'}
              {activeTab === 'insights' && 'Analytics'}
              {activeTab === 'calendar' && 'Schedule Overview'}
            </h1>
            <p className="text-slate-500 font-semibold mt-1">
              {activeTab === 'schedule' && `Welcome back, ${user.username}.`}
              {activeTab === 'roadmap' && "Generate personalized learning paths."}
              {activeTab === 'insights' && "Visualize your learning trends."}
              {activeTab === 'calendar' && "Your monthly learning timeline."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${user.username}&background=4f46e5&color=fff`} alt="User" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.username}</p>
            </div>
          </div>
        </header>

        <div className="w-full">
          {activeTab === 'schedule' && <SmartSchedule userId={user.id} />}
          {activeTab === 'roadmap' && <RoadmapGenerator userId={user.id} onGenerated={() => setActiveTab('schedule')} />}
          {activeTab === 'insights' && <Insights userId={user.id} />}
          {activeTab === 'calendar' && <CalendarView userId={user.id} />}
        </div>
      </main>
    </div>
  )
}
