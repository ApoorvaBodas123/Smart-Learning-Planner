import { useEffect, useState } from 'react'
import axios from 'axios'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, Award, CheckCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export const Insights = ({ userId }: { userId: number }) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${API_URL}/analytics/`)
        setData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [userId])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="font-bold uppercase tracking-widest text-xs">Calculating Mastery...</p>
    </div>
  )

  if (!data) return null

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card flex items-center gap-6">
           <div className="p-4 bg-primary/10 rounded-2xl">
              <TrendingUp className="text-primary" size={32} />
           </div>
           <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Mastery Level</p>
              <h3 className="text-3xl font-black text-foreground">{data.completion_rate}%</h3>
           </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card flex items-center gap-6">
           <div className="p-4 bg-muted rounded-2xl">
              <Award className="text-muted-foreground" size={32} />
           </div>
           <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Current Streak</p>
              <h3 className="text-3xl font-black text-foreground">{data.streak} Days</h3>
           </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card flex items-center gap-6">
           <div className="p-4 bg-primary/10 rounded-2xl">
              <CheckCircle className="text-primary" size={32} />
           </div>
           <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Tasks Done</p>
              <h3 className="text-3xl font-black text-foreground">{data.total_completed}</h3>
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card lg:col-span-2">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Learning Consistency</h3>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.daily_history}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="tasks" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="card">
            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6">Roadmap Timeline</h3>
            <div className="space-y-4">
               {['May', 'June', 'July', 'August'].map((month, i) => (
                 <div key={month} className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-muted-foreground w-12">{month}</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }} 
                         animate={{ width: `${Math.max(10, 80 - i*20)}%` }} 
                         className="h-full bg-primary" 
                       />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{Math.max(2, 12 - i*3)} Tasks</span>
                 </div>
               ))}
            </div>
            <div className="mt-10 p-5 bg-primary rounded-xl shadow-lg border border-primary/20">
               <p className="text-[10px] font-black text-white/60 uppercase mb-2 tracking-widest">Next Milestone</p>
               <h4 className="font-bold text-white text-lg leading-tight">Goal Completion</h4>
               <p className="text-xs text-white/70 mt-1 italic">Keep pushing your streak!</p>
            </div>
        </div>
      </div>
    </div>
  )
}
