import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Sparkles, Loader2, CheckCircle, Trash2 } from 'lucide-react'

export const RoadmapGenerator = ({ userId, onGenerated }: { userId: number, onGenerated: () => void }) => {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState('4')
  const [level, setLevel] = useState('Beginner')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [roadmaps, setRoadmaps] = useState<any[]>([])

  useEffect(() => {
    fetchRoadmaps()
  }, [])

  const fetchRoadmaps = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/roadmaps/`)
      setRoadmaps(res.data)
    } catch (err) { console.error(err) }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt) return
    setLoading(true)
    try {
      await axios.post(`http://127.0.0.1:8000/generate-roadmap/`, { 
        prompt, 
        duration_months: parseInt(duration),
        level
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setPrompt('')
        fetchRoadmaps()
        onGenerated()
      }, 2000)
    } catch (err) {
      console.error(err)
      alert("Failed to generate roadmap. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const deleteRoadmap = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this roadmap and all its tasks?")) return
    try {
      await axios.delete(`http://127.0.0.1:8000/roadmaps/${id}`)
      fetchRoadmaps()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-8">
      <div className="card bg-slate-900 border-none relative overflow-hidden text-white p-8">
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-primary" size={24} />
            <h3 className="text-xl font-bold">Generate Roadmap with AI</h3>
          </div>
          
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
               <label className="block text-sm font-bold text-slate-400 mb-2">What is your learning goal?</label>
               <textarea 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="e.g. I want to become a full-stack Django developer and launch a SaaS product&#10;e.g. Learn React and build a job-ready portfolio&#10"
                 className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary transition-all min-h-[120px] resize-none text-sm"
               />
               <p className="text-[10px] text-slate-500 mt-2">The more detail you provide, the more relevant your roadmap will be.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Duration</label>
                  <select 
                    value={duration} onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm appearance-none"
                  >
                     <option value="1">1 Month</option>
                     <option value="2">2 Months</option>
                     <option value="3">3 Months</option>
                     <option value="4">4 Months</option>
                     <option value="6">6 Months</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Current Level</label>
                  <select 
                    value={level} onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm appearance-none"
                  >
                     <option value="Beginner">Beginner</option>
                     <option value="Intermediate">Intermediate</option>
                     <option value="Advanced">Advanced</option>
                  </select>
               </div>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex gap-3 text-sm text-slate-400">
               <span>ⓘ</span>
               <p>AI will generate a complete roadmap with months, weeks, and topics based on your goal. After generation, activate the roadmap to view it on your dashboard.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button 
                disabled={loading || success}
                className="px-6 py-2.5 rounded-lg font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all text-sm"
                type="button"
                onClick={() => setPrompt('')}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading || success}
                className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all text-sm ${
                  success ? 'bg-primary text-white' : 'bg-primary hover:bg-indigo-500 text-white'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : success ? <CheckCircle size={16} /> : <Sparkles size={16} />}
                {loading ? 'Generating...' : success ? 'Done!' : 'Generate Roadmap'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Active Roadmaps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {roadmaps.map((rm) => (
             <div key={rm.id} className="card flex justify-between items-center group">
                <div>
                   <h4 className="font-bold text-slate-800">{rm.goal}</h4>
                   <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Target: {rm.target_completion_date}</p>
                </div>
                <button 
                  onClick={() => deleteRoadmap(rm.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                   <Trash2 size={18} />
                </button>
             </div>
           ))}
           {roadmaps.length === 0 && (
             <p className="text-sm text-slate-400 italic px-2">No roadmaps generated yet.</p>
           )}
        </div>
      </div>
    </div>
  )
}
