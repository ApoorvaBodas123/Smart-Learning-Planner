import { useState, useEffect } from 'react'
import axios from 'axios'
import { CheckCircle, Circle, Plus, Clock } from 'lucide-react'

interface Task {
  id: number;
  title: string;
  estimated_hours: number;
  is_completed: boolean;
  due_date?: string;
}

interface TaskManagerProps {
  subjectId: number;
  onTaskUpdate: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export const TaskManager = ({ subjectId, onTaskUpdate }: TaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newHours, setNewHours] = useState(1)
  const [newDueDate, setNewDueDate] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [subjectId])

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/subjects/${subjectId}/tasks/`)
      setTasks(res.data)
    } catch (err) {
      console.error("Failed to fetch tasks", err)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle) return
    try {
      await axios.post(`${API_URL}/tasks/?subject_id=${subjectId}`, {
        title: newTitle,
        estimated_hours: newHours,
        due_date: newDueDate
      })
      setNewTitle('')
      setNewDueDate('')
      fetchTasks()
      onTaskUpdate()
    } catch (err) {
      console.error("Failed to add task", err)
    }
  }

  const toggleTask = async (taskId: number) => {
    try {
      await axios.patch(`${API_URL}/tasks/${taskId}/toggle`)
      fetchTasks()
      onTaskUpdate()
    } catch (err) {
      console.error("Failed to toggle task", err)
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Task Backlog</h4>
      <div className="space-y-3 mb-6">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between bg-slate-50/50 p-3 rounded-xl border border-slate-100 group">
            <div className="flex items-center gap-3">
              <button onClick={() => toggleTask(task.id)} className="transition-all hover:scale-110">
                {task.is_completed ? 
                  <CheckCircle size={18} className="text-green-600" /> : 
                  <Circle size={18} className="text-slate-300" />
                }
              </button>
              <div className="flex flex-col">
                <span className={`text-sm font-semibold transition-all ${task.is_completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                  {task.title}
                </span>
                {task.due_date && (
                  <span className="text-[9px] text-red-500 font-black uppercase mt-0.5">Deadline: {task.due_date}</span>
                )}
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
              <Clock size={10} className="text-slate-300" /> {task.estimated_hours}h
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddTask} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="flex gap-3 mb-3">
          <input 
            type="text" value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-transparent border-none text-sm font-medium outline-none placeholder:text-slate-400"
          />
          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
             <Clock size={12} className="text-slate-400" />
             <input 
                type="number" value={newHours} min="1"
                onChange={(e) => setNewHours(parseInt(e.target.value))}
                className="w-8 text-xs font-bold outline-none bg-transparent"
              />
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input 
              type="date" value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none text-slate-500 shadow-sm"
            />
          </div>
          <button type="submit" className="bg-slate-800 text-white p-2 rounded-lg hover:bg-black transition-all shadow-md">
            <Plus size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
  
