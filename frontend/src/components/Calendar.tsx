import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export const CalendarView = ({ userId }: { userId: number }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/all-tasks/`)
      setTasks(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mastery Calendar</h2>
          <p className="text-sm text-slate-500 font-medium">Visualize your upcoming milestones and deadlines.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <span className="font-bold text-slate-800 dark:text-white min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="card p-0 overflow-hidden border-none shadow-xl">
        <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.due_date), day))
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isToday = isSameDay(day, new Date())

            return (
              <div 
                key={i} 
                className={`min-h-[120px] p-2 border-r border-b border-slate-100 dark:border-slate-800 transition-colors ${
                  !isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/30' : 'bg-white dark:bg-slate-900'
                } ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-bold ${
                    isToday ? 'bg-primary text-white w-6 h-6 flex items-center justify-center rounded-full' : 
                    isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {dayTasks.map((task, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx} 
                      className="px-2 py-1 bg-primary/10 dark:bg-primary/20 border-l-2 border-primary rounded text-[9px] font-bold text-primary truncate cursor-default"
                      title={task.title}
                    >
                      {task.title}
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
