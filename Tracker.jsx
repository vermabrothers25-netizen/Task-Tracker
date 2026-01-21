import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Clock, Bell, Play, Pause, Square, Mail, BarChart3, Target, Briefcase, X, Timer, TrendingUp, Calendar, Zap, Download, Upload, FileJson } from 'lucide-react';

export default function TaskTracker() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('work');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [workSessions, setWorkSessions] = useState([]);
  const [showTimer, setShowTimer] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showDataModal, setShowDataModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedName = localStorage.getItem('taskTrackerName');
    if (savedName) {
      setUserName(savedName);
      setShowNamePrompt(false);
    }
    setDueDate(new Date().toISOString().split('T')[0]);
    loadTasks();
    const interval = setInterval(loadTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userName) loadWorkSessions();
  }, [userName]);

  useEffect(() => {
    let interval;
    if (timerRunning && !timerPaused) {
      interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerPaused]);

  const loadWorkSessions = async () => {
    try {
      const result = await window.storage.get('work-' + userName, false);
      if (result && result.value) setWorkSessions(JSON.parse(result.value));
    } catch (e) {
      setWorkSessions([]);
    }
  };

  const saveWorkSessions = async (sessions) => {
    try {
      await window.storage.set('work-' + userName, JSON.stringify(sessions), false);
    } catch (e) {}
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0') + ':' + s.toString().padStart(2, '0');
  };

  const getWorkStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekStr = weekStart.toISOString().split('T')[0];
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthStr = monthStart.toISOString().split('T')[0];

    const daily = workSessions.filter(s => s.dateStr === today).reduce((a, s) => a + s.duration, 0);
    const weekly = workSessions.filter(s => s.dateStr >= weekStr).reduce((a, s) => a + s.duration, 0);
    const monthly = workSessions.filter(s => s.dateStr >= monthStr).reduce((a, s) => a + s.duration, 0);

    return { daily: formatTime(daily), weekly: formatTime(weekly), monthly: formatTime(monthly) };
  };

  const startTimer = () => {
    setTimerRunning(true);
    setTimerPaused(false);
    setTimerSeconds(0);
  };

  const stopTimer = () => {
    if (timerSeconds > 0) {
      const session = { id: Date.now(), userName, duration: timerSeconds, date: new Date().toISOString(), dateStr: new Date().toISOString().split('T')[0] };
      const updated = [...workSessions, session];
      setWorkSessions(updated);
      saveWorkSessions(updated);
    }
    setTimerRunning(false);
    setTimerPaused(false);
    setTimerSeconds(0);
  };

  const addNotif = (msg, type) => {
    const n = { id: Date.now(), message: msg, type };
    setNotifications(prev => [n, ...prev].slice(0, 5));
    setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 4000);
  };

  const loadTasks = async () => {
    try {
      const result = await window.storage.get('tasks-v6', true);
      if (result && result.value) {
        const loaded = JSON.parse(result.value);
        if (tasks.length > 0 && userName) {
          const newTasks = loaded.filter(lt => !tasks.find(t => t.id === lt.id));
          const newComps = loaded.filter(lt => {
            const old = tasks.find(t => t.id === lt.id);
            return old && !old.completed && lt.completed;
          });
          newTasks.forEach(t => { if (t.createdBy !== userName) addNotif(t.createdBy + ' added: "' + t.text + '"', 'info'); });
          newComps.forEach(t => { if (t.completedBy !== userName) addNotif(t.completedBy + ' completed: "' + t.text + '"', 'success'); });
        }
        setTasks(loaded);
      }
    } catch (e) {
      setTasks([]);
    }
  };

  const saveTasks = async (updated) => {
    try {
      await window.storage.set('tasks-v6', JSON.stringify(updated), true);
    } catch (e) {}
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now(), text: newTask, completed: false, category, priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(), createdBy: userName, completedBy: null, completedAt: null
    };
    const updated = [...tasks, task];
    setTasks(updated);
    saveTasks(updated);
    setNewTask('');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = task.dueDate.split('-');
    const due = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    due.setHours(0, 0, 0, 0);
    const days = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (days === 0) addNotif('Task due TODAY: "' + task.text + '"', 'warning');
    else if (days === 1) addNotif('Task created — due tomorrow', 'info');
    else if (days > 1) addNotif('Task created — ' + days + ' days left', 'success');
    else addNotif('Task is overdue!', 'error');
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const completing = !t.completed;
        if (completing) addNotif('Completed: "' + t.text + '"', 'success');
        return { ...t, completed: completing, completedBy: completing ? userName : null, completedAt: completing ? new Date().toISOString() : null };
      }
      return t;
    });
    setTasks(updated);
    saveTasks(updated);
  };

  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  const exportData = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: userName,
      tasks: tasks,
      workSessions: workSessions
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotif('Data exported successfully!', 'success');
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (!data.tasks || !Array.isArray(data.tasks)) {
          addNotif('Invalid backup file format', 'error');
          return;
        }
        
        // Merge tasks - add imported tasks that don't exist
        const existingIds = new Set(tasks.map(t => t.id));
        const newTasks = data.tasks.filter(t => !existingIds.has(t.id));
        const mergedTasks = [...tasks, ...newTasks];
        setTasks(mergedTasks);
        await saveTasks(mergedTasks);
        
        // Merge work sessions if present
        if (data.workSessions && Array.isArray(data.workSessions)) {
          const existingSessionIds = new Set(workSessions.map(s => s.id));
          const newSessions = data.workSessions.filter(s => !existingSessionIds.has(s.id));
          const mergedSessions = [...workSessions, ...newSessions];
          setWorkSessions(mergedSessions);
          await saveWorkSessions(mergedSessions);
        }
        
        addNotif(`Imported ${newTasks.length} tasks${data.workSessions ? ` and work sessions` : ''}`, 'success');
        setShowDataModal(false);
      } catch (err) {
        addNotif('Failed to parse backup file', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setTasks([]);
      setWorkSessions([]);
      await saveTasks([]);
      await saveWorkSessions([]);
      addNotif('All data cleared', 'warning');
      setShowDataModal(false);
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    todayPending: tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0] && !t.completed).length,
    userCreated: tasks.filter(t => t.createdBy === userName).length,
    userCompleted: tasks.filter(t => t.completedBy === userName).length
  };

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const workStats = getWorkStats();

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'today') return t.dueDate === new Date().toISOString().split('T')[0];
    return true;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const categoryColors = {
    work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    sales: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    marketing: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    finance: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    operations: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    critical: 'bg-red-500/20 text-red-300 border-red-500/30'
  };

  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
        <div className="relative bg-zinc-900/80 backdrop-blur-xl p-10 rounded-3xl border border-zinc-800 shadow-2xl max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/25">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome</h2>
          <p className="text-zinc-400 mb-8">Enter your name to start tracking tasks with your team.</p>
          <input 
            type="text" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter' && userName.trim()) { localStorage.setItem('taskTrackerName', userName.trim()); setShowNamePrompt(false); } }}
            placeholder="Your name"
            className="w-full px-5 py-4 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4 text-lg transition-all"
            autoFocus
          />
          <button 
            onClick={() => { if (userName.trim()) { localStorage.setItem('taskTrackerName', userName.trim()); setShowNamePrompt(false); } }}
            disabled={!userName.trim()}
            className="w-full px-5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-semibold text-lg disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`px-4 py-3 rounded-xl shadow-xl backdrop-blur-xl border animate-in slide-in-from-right duration-300 ${
              n.type === 'error' ? 'bg-red-500/90 border-red-400/50' : 
              n.type === 'warning' ? 'bg-amber-500/90 border-amber-400/50' : 
              n.type === 'success' ? 'bg-emerald-500/90 border-emerald-400/50' : 
              'bg-blue-500/90 border-blue-400/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-white/90 flex-shrink-0" />
              <p className="text-white text-sm font-medium">{n.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timer Modal */}
      {showTimer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl max-w-md w-full relative">
            <button onClick={() => setShowTimer(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Focus Timer</h2>
                <p className="text-zinc-500 text-sm">Track your work sessions</p>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-white mb-6 font-mono tracking-wider">{formatTime(timerSeconds)}</div>
              <div className="flex gap-3 justify-center">
                {!timerRunning ? (
                  <button onClick={startTimer} className="px-8 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 font-semibold shadow-lg shadow-emerald-500/25">
                    <Play className="w-5 h-5" /> Start
                  </button>
                ) : (
                  <>
                    <button onClick={() => setTimerPaused(!timerPaused)} className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2 font-semibold">
                      <Pause className="w-5 h-5" /> {timerPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button onClick={stopTimer} className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 font-semibold">
                      <Square className="w-5 h-5" /> Stop
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50">
              <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Your Hours</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white font-mono">{workStats.daily}</div>
                  <div className="text-xs text-zinc-500 mt-1">Today</div>
                </div>
                <div className="text-center border-x border-zinc-700">
                  <div className="text-2xl font-bold text-white font-mono">{workStats.weekly}</div>
                  <div className="text-xs text-zinc-500 mt-1">This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white font-mono">{workStats.monthly}</div>
                  <div className="text-xs text-zinc-500 mt-1">This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl max-w-md w-full relative">
            <button onClick={() => setShowStats(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Your Stats</h2>
                <p className="text-zinc-500 text-sm">Personal productivity metrics</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-5 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Tasks Created</p>
                    <p className="text-white text-4xl font-bold mt-1">{stats.userCreated}</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Plus className="w-7 h-7 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl p-5 border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-300 text-sm font-medium">Tasks Completed</p>
                    <p className="text-white text-4xl font-bold mt-1">{stats.userCompleted}</p>
                  </div>
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-5 border border-purple-500/20">
                <p className="text-purple-300 text-sm font-medium mb-4">Work Hours</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white font-mono">{workStats.daily}</div>
                    <div className="text-xs text-zinc-500 mt-1">Today</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white font-mono">{workStats.weekly}</div>
                    <div className="text-xs text-zinc-500 mt-1">Week</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white font-mono">{workStats.monthly}</div>
                    <div className="text-xs text-zinc-500 mt-1">Month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Management Modal */}
      {showDataModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl max-w-md w-full relative">
            <button onClick={() => setShowDataModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <FileJson className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Data Management</h2>
                <p className="text-zinc-500 text-sm">Export, import, or clear your data</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Current Data Summary */}
              <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50">
                <p className="text-zinc-400 text-sm font-medium mb-3">Current Data</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">{tasks.length}</div>
                    <div className="text-xs text-zinc-500">Tasks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{workSessions.length}</div>
                    <div className="text-xs text-zinc-500">Work Sessions</div>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <button 
                onClick={exportData}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-4 hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-3 font-semibold shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-5 h-5" />
                Download Backup
              </button>
              
              {/* Import Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={importData}
                accept=".json"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-zinc-800 text-white rounded-xl p-4 hover:bg-zinc-700 transition-all flex items-center justify-center gap-3 font-semibold border border-zinc-700"
              >
                <Upload className="w-5 h-5" />
                Import from Backup
              </button>
              
              {/* Clear Data Button */}
              <button 
                onClick={clearAllData}
                className="w-full bg-red-500/10 text-red-400 rounded-xl p-4 hover:bg-red-500/20 transition-all flex items-center justify-center gap-3 font-semibold border border-red-500/30"
              >
                <Trash2 className="w-5 h-5" />
                Clear All Data
              </button>
              
              <p className="text-zinc-500 text-xs text-center mt-4">
                Backups are saved as JSON files. Import merges data without duplicates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative max-w-5xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TaskFlow</h1>
              <p className="text-zinc-500 text-sm">Welcome back, <span className="text-indigo-400">{userName}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDataModal(true)} className="p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700/50 transition-all group">
              <Download className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
            </button>
            <button onClick={() => setShowTimer(true)} className="p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700/50 transition-all group">
              <Clock className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
            </button>
            <button onClick={() => setShowStats(true)} className="p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700/50 transition-all group">
              <BarChart3 className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
            </button>
            <a href="https://mail.google.com/mail/u/0/#inbox" target="_blank" rel="noopener noreferrer" className="p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700/50 transition-all group">
              <Mail className="w-5 h-5 text-zinc-400 group-hover:text-red-400 transition-colors" />
            </a>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/50 backdrop-blur rounded-2xl p-5 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-5 h-5 text-indigo-400" />
              <span className="text-xs text-zinc-500">Total</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur rounded-2xl p-5 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-zinc-500">Done</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.completed}</div>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur rounded-2xl p-5 border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <Circle className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-zinc-500">Pending</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.pending}</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur rounded-2xl p-5 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span className="text-xs text-indigo-300">Due Today</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.todayPending}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-zinc-900/50 backdrop-blur rounded-2xl p-5 border border-zinc-800 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-400">Overall Progress</span>
            <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out rounded-full" 
              style={{ width: progress + '%' }} 
            />
          </div>
        </div>

        {/* Add Task */}
        <div className="bg-zinc-900/50 backdrop-blur rounded-2xl p-6 border border-zinc-800 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            New Task
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input 
              type="text" 
              value={newTask} 
              onChange={(e) => setNewTask(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && addTask()} 
              placeholder="What needs to be done?"
              className="px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="work">💼 Work</option>
              <option value="sales">📈 Sales</option>
              <option value="marketing">📣 Marketing</option>
              <option value="finance">💰 Finance</option>
              <option value="operations">⚙️ Operations</option>
              <option value="critical">🚨 Critical</option>
            </select>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)}
              className="px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="high">🔴 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>
            <input 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)}
              className="px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={addTask}
            className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 justify-center font-semibold shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'active', 'today', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'today' && stats.todayPending > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.todayPending}</span>
              )}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="bg-zinc-900/50 backdrop-blur rounded-2xl border border-zinc-800 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
              <p className="text-zinc-500">Add your first task above to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {filteredTasks.map(task => {
                const overdue = task.dueDate < new Date().toISOString().split('T')[0] && !task.completed;
                const isToday = task.dueDate === new Date().toISOString().split('T')[0];
                return (
                  <div 
                    key={task.id} 
                    className={`p-4 hover:bg-zinc-800/30 transition-all ${overdue ? 'bg-red-500/5' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-zinc-500 hover:text-indigo-400 transition-colors" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-white font-medium ${task.completed ? 'line-through text-zinc-500' : ''}`}>
                          {task.text}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${categoryColors[task.category]}`}>
                            {task.category}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-300' : 
                            task.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' : 
                            'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            overdue ? 'bg-red-500/30 text-red-300' : 
                            isToday ? 'bg-indigo-500/20 text-indigo-300' : 
                            'bg-zinc-700/50 text-zinc-400'
                          }`}>
                            {overdue ? '⚠️ Overdue' : new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-zinc-500 text-xs">by {task.createdBy}</span>
                          {task.completed && task.completedBy && (
                            <span className="text-emerald-400 text-xs">✓ {task.completedBy}</span>
                          )}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <p className="text-center text-zinc-600 text-sm mt-8">
          TaskFlow • Collaborative task management
        </p>
      </div>
    </div>
  );
}
