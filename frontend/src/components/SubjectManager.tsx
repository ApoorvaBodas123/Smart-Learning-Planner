import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { TaskManager } from './TaskManager'
interface Subject {
    id: number;
    name: string;
    difficulty: number;
    tasks?: any[]; // Add this
}

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export const SubjectManager = ({ userId: _userId }: { userId: number }) => {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [newName, setNewName] = useState('')
    const [newDifficulty, setNewDifficulty] = useState(3)

    // 1. Fetch subjects when the component loads
    useEffect(() => {
        fetchSubjects()
    }, [])

    const fetchSubjects = async () => {
        try {
            const res = await axios.get(`${API_URL}/subjects/`)
            setSubjects(res.data)
        } catch (err) {
            console.error("Failed to fetch subjects", err)
        }
    }

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await axios.post(`${API_URL}/subjects/`, {
                name: newName,
                difficulty: newDifficulty
            })
            setNewName('')
            fetchSubjects() // Refresh the list
        } catch (err) {
            console.error("Failed to add subject", err)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full items-start">
            {/* ADD SUBJECT FORM */}
            <div className="card h-fit sticky top-10">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                    <Plus size={20} className="text-green-600" /> New Subject
                </h2>
                <form onSubmit={handleAddSubject} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject Name</label>
                        <input 
                            type="text" required value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. Physics, Marketing..."
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Difficulty (1-5)</label>
                        <input 
                            type="range" min="1" max="5" value={newDifficulty}
                            onChange={(e) => setNewDifficulty(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2">
                            <span>EASY</span>
                            <span>HARD</span>
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                        Add Subject
                    </button>
                </form>
            </div>

            {/* SUBJECT LIST */}
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Your Curriculum</h2>
                <div className="grid grid-cols-1 gap-6">
                    {subjects.length === 0 ? (
                        <p className="text-slate-400 italic py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">No subjects added yet. Start by adding one!</p>
                    ) : (
                        subjects.map((sub) => {
                            const totalTasks = sub.tasks?.length || 0;
                            const doneTasks = sub.tasks?.filter(t => t.is_completed).length || 0;
                            const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

                            return (
                                <motion.div 
                                    key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="card overflow-hidden border-l-4"
                                    style={{ borderLeftColor: progress === 100 ? '#10b981' : '#00592d' }}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-700">
                                                <BookOpen size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-slate-800 text-lg">{sub.name}</h3>
                                                    <button 
                                                        onClick={async () => {
                                                            if(window.confirm("Delete this subject?")) {
                                                                await axios.delete(`${API_URL}/subjects/${sub.id}`);
                                                                fetchSubjects();
                                                            }
                                                        }}
                                                        className="text-slate-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Difficulty: {sub.difficulty}/5</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-800">{doneTasks}/{totalTasks} Tasks</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Progress</div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-8">
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="h-full bg-green-600"
                                            />
                                        </div>
                                    </div>

                                    <TaskManager subjectId={sub.id} onTaskUpdate={fetchSubjects} />
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
