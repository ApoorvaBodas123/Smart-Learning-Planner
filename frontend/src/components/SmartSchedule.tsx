import { useState } from 'react'
import axios from 'axios'
import { Sparkles, Brain, Clock, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export const SmartSchedule = ({ userId }: { userId: number }) => {
  const [schedule, setSchedule] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const getSchedule = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`http://127.0.0.1:8000/users/${userId}/schedule/`)
      setSchedule(res.data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const getAIAnalysis = async () => {
    setAiLoading(true)
    try {
      const res = await axios.get(`http://127.0.0.1:8000/users/${userId}/ai-analysis/`)
      setAiAnalysis(res.data.analysis)
    } catch (err) { console.error(err) } finally { setAiLoading(false) }
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Brain className="text-green-600" /> Study Optimizer
          </h2>
          <p className="text-sm text-slate-500 mt-1">Smart scheduling based on your priority and capacity.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={getAIAnalysis} disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Sparkles size={16} className="text-green-600" /> {aiLoading ? "Analyzing..." : "AI Insight"}
          </button>
          <button 
            onClick={getSchedule} disabled={loading}
            className="btn-primary flex items-center gap-2 shadow-md shadow-green-900/10"
          >
            <Brain size={18} /> {loading ? "Computing..." : "Generate Optimal Plan"}
          </button>
        </div>
      </div>

      {aiAnalysis && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-12 mt-12 p-8 bg-green-50 border border-green-100 rounded-2xl text-sm text-green-900 font-medium leading-relaxed relative pt-20 shadow-sm"
        >
          <div className="absolute -top-6 left-8 px-5 py-2 bg-green-700 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg z-10 border-2 border-white">AI Recommendation</div>
          <Sparkles size={20} className="inline mr-2 text-green-600 mb-1" /> {aiAnalysis}
        </motion.div>
      )}

      {schedule && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-5">
            <div className="flex justify-between items-center px-2 mb-2">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recommended Order</h3>
               <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Based on Deadlines + Difficulty</span>
            </div>
            {schedule.today_focus.map((task: any, i: number) => (
              <div key={i} className="card flex justify-between items-center group hover:border-green-400 transition-all">
                <div className="flex gap-6 items-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">{i+1}</div>
                  <div>
                    <div className="flex items-center gap-3">
                       <p className="text-[10px] text-green-600 font-black uppercase tracking-wider">{task.subject}</p>
                       {task.due_date && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-bold border border-red-100">Due {task.due_date}</span>}
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mt-0.5">{task.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Clock size={12} className="text-slate-400" /> {task.hours} Hours
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-2">
                   <div className="flex gap-1.5">
                     {[...Array(Math.min(8, task.pomodoro_chunks))].map((_, idx) => (
                       <div key={idx} className="w-3 h-3 bg-green-500 rounded-sm shadow-sm" />
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
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-3xl" />
                <h3 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest text-center">Efficiency Stats</h3>
                <div className="text-6xl font-black text-white tracking-tighter mb-2">{schedule.total_estimated_time}h</div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Total Time Commitment</p>
            </div>
            
            <div className="card bg-green-50 border-green-100 border-dashed p-6">
               <p className="text-[10px] text-green-700 font-black uppercase mb-4 flex items-center gap-2 tracking-widest"><Sparkles size={14}/> Daily Study Tip</p>
               <p className="text-sm text-green-900 font-medium leading-relaxed italic">"{schedule.ai_tip}"</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

