import { useState, useEffect } from 'react'
import axios from 'axios'
import { Clock, RefreshCcw, ExternalLink, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export const SmartSchedule = ({ userId }: { userId: number }) => {
  const [schedule, setSchedule] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [roadmaps, setRoadmaps] = useState<any[]>([])
  const [activeRoadmapId, setActiveRoadmapId] = useState<number | null>(null)

  useEffect(() => {
    fetchRoadmaps()
  }, [])

  useEffect(() => {
    getSchedule(activeRoadmapId)
  }, [activeRoadmapId])

  const fetchRoadmaps = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/roadmaps/`)
      setRoadmaps(res.data)
      if (res.data.length > 0 && !activeRoadmapId) {
        setActiveRoadmapId(res.data[0].id)
      }
    } catch (err) { console.error(err) }
  }

  const getSchedule = async (roadmapId: number | null) => {
    setLoading(true)
    try {
      const url = roadmapId ? `http://127.0.0.1:8000/schedule/?roadmap_id=${roadmapId}` : `http://127.0.0.1:8000/schedule/`
      const res = await axios.get(url)
      setSchedule(res.data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const toggleTask = async (taskId: number) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/tasks/${taskId}/toggle`)
      getSchedule(activeRoadmapId)
    } catch (err) { console.error(err) }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Focused Schedule
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Your daily tasks, isolated by goal.</p>
        </div>
      </div>

      {roadmaps.length > 0 && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveRoadmapId(null)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeRoadmapId === null ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Goals
          </button>
          {roadmaps.map(rm => (
            <button 
              key={rm.id}
              onClick={() => setActiveRoadmapId(rm.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeRoadmapId === rm.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {rm.goal}
            </button>
          ))}
        </div>
      )}

      {schedule && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-5">
            <div className="flex justify-between items-center px-2 mb-2">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recommended Order</h3>
               <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Based on Deadlines + Difficulty</span>
            </div>
            {schedule.today_focus.map((task: any, i: number) => (
              <div key={i} className="card flex justify-between items-center group hover:border-primary transition-all">
                <div className="flex gap-6 items-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-primary transition-colors">{i+1}</div>
                  <div>
                    <div className="flex items-center gap-3">
                       <p className="text-[10px] text-primary font-black uppercase tracking-wider">{task.subject} — {task.goal}</p>
                       {task.due_date && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-bold border border-red-100">Due {task.due_date}</span>}
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mt-0.5">{task.title}</h4>
                    {task.description && <p className="text-[11px] text-slate-400 italic mt-1 leading-relaxed max-w-md">{task.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Clock size={12} className="text-slate-400" /> {task.hours} Hours
                      </span>
                      {task.resource_url && (
                        <a 
                          href={task.resource_url} target="_blank" rel="noreferrer"
                          className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={10} /> View Resource
                        </a>
                      )}
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className="text-[10px] font-black text-primary hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1 ml-4"
                      >
                         Done
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-2">
                   <div className="flex gap-1.5">
                     {[...Array(Math.min(8, task.pomodoro_chunks))].map((_, idx) => (
                       <div key={idx} className="w-3 h-3 bg-primary rounded-sm shadow-sm opacity-80" />
                     ))}
                     {task.pomodoro_chunks > 8 && <span className="text-[10px] text-slate-400 font-bold ml-1">+{task.pomodoro_chunks - 8} more</span>}
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pomodoro Sessions</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <div className="card bg-slate-900 border-none relative overflow-hidden flex flex-col items-center justify-center py-10">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
                <h3 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest text-center">Efficiency Stats</h3>
                <div className="text-6xl font-black text-white tracking-tighter mb-2">{schedule.total_estimated_time}h</div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Total Time Commitment</p>
            </div>
            
            <div className="card bg-indigo-50 border-indigo-100 border-dashed p-6">
               <p className="text-[10px] text-indigo-700 font-black uppercase mb-4 flex items-center gap-2 tracking-widest"><TrendingUp size={14}/> Overall Mastery</p>
               <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-primary h-full" style={{ width: `${schedule.completion_rate}%` }} />
               </div>
               <p className="text-sm text-indigo-900 font-bold leading-relaxed">{schedule.completion_rate}% Completed</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
