import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue, set, push, remove, update } from 'firebase/database';
import { CheckCircle2, Circle, Plus, Trash2, Clock, Bell, Play, Pause, Square, BarChart3, Target, X, Timer, TrendingUp, Calendar, Zap, Download, Upload, FileJson, LogOut, Users } from 'lucide-react';

// ⚠️ REPLACE WITH YOUR FIREBASE CONFIG ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyCzy04TRJCtkj0seZFi0Y_LNbI-lL7soiw",
  authDomain: "tracker-86772.firebaseapp.com",
  databaseURL: "https://tracker-86772-default-rtdb.firebaseio.com",
  projectId: "tracker-86772",
  storageBucket: "tracker-86772.firebasestorage.app",
  messagingSenderId: "345847463092",
  appId: "1:345847463092:web:37fd2aa67b13a60cc8ebe1",
  measurementId: "G-LL6SX4V950"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

export default function TaskTracker() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('work');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [workSessions, setWorkSessions] = useState([]);
  const [showTimer, setShowTimer] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showDataModal, setShowDataModal] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const fileInputRef = useRef(null);
  const prevTasksRef = useRef([]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        // Register user in team members
        const userRef = ref(db, `team/${currentUser.uid}`);
        set(userRef, {
          uid: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email,
          photo: currentUser.photoURL,
          lastSeen: Date.now()
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Set default due date
  useEffect(() => {
    setDueDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Listen to tasks in real-time
  useEffect(() => {
    if (!user) return;
    
    const tasksRef = ref(db, 'tasks');
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      const taskList = data ? Object.entries(data).map(([id, task]) => ({ id, ...task })) : [];
      
      // Check for new tasks or completions from other users
      if (prevTasksRef.current.length > 0) {
        const prevIds = new Set(prevTasksRef.current.map(t => t.id));
        const newTasks = taskList.filter(t => !prevIds.has(t.id) && t.createdBy !== user.displayName);
        newTasks.forEach(t => addNotif(`${t.createdBy} added: "${t.text}"`, 'info'));
        
        taskList.forEach(t => {
          const prev = prevTasksRef.current.find(p => p.id === t.id);
          if (prev && !prev.completed && t.completed && t.completedBy !== user.displayName) {
            addNotif(`${t.completedBy} completed: "${t.text}"`, 'success');
          }
        });
      }
      
      prevTasksRef.current = taskList;
      setTasks(taskList);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Listen to work sessions
  useEffect(() => {
    if (!user) return;
    
    const sessionsRef = ref(db, `workSessions/${user.uid}`);
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      const sessionList = data ? Object.entries(data).map(([id, session]) => ({ id, ...session })) : [];
      setWorkSessions(sessionList);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Listen to team members
  useEffect(() => {
    const teamRef = ref(db, 'team');
    const unsubscribe = onValue(teamRef, (snapshot) => {
      const data = snapshot.val();
      const members = data ? Object.values(data) : [];
      setTeamMembers(members);
    });
    
    return () => unsubscribe();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    if (timerRunning && !timerPaused) {
      interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerPaused]);

  // Update last seen periodically
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      const userRef = ref(db, `team/${user.uid}/lastSeen`);
      set(userRef, Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
      addNotif('Failed to sign in', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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

  const stopTimer = async () => {
    if (timerSeconds > 0 && user) {
      const sessionsRef = ref(db, `workSessions/${user.uid}`);
      await push(sessionsRef, {
        userName: user.displayName,
        duration: timerSeconds,
        date: new Date().toISOString(),
        dateStr: new Date().toISOString().split('T')[0]
      });
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

  const addTask = async () => {
    if (!newTask.trim() || !user) return;
    
    const tasksRef = ref(db, 'tasks');
    await push(tasksRef, {
      text: newTask,
      completed: false,
      category,
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      createdBy: user.displayName,
      createdByUid: user.uid,
      completedBy: null,
      completedAt: null
    });
    
    setNewTask('');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = dueDate.split('-');
    const due = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    due.setHours(0, 0, 0, 0);
    const days = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (days === 0) addNotif('Task due TODAY!', 'warning');
    else if (days === 1) addNotif('Task created — due tomorrow', 'info');
    else if (days > 1) addNotif(`Task created — ${days} days left`, 'success');
    else addNotif('Task is overdue!', 'error');
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !user) return;
    
    const completing = !task.completed;
    const taskRef = ref(db, `tasks/${id}`);
    await update(taskRef, {
      completed: completing,
      completedBy: completing ? user.displayName : null,
      completedByUid: completing ? user.uid : null,
      completedAt: completing ? new Date().toISOString() : null
    });
    
    if (completing) addNotif(`Completed: "${task.text}"`, 'success');
  };

  const deleteTask = async (id) => {
    const taskRef = ref(db, `tasks/${id}`);
    await remove(taskRef);
  };

  const exportData = () => {
    const data = {
      version: '2.0-firebase',
      exportedAt: new Date().toISOString(),
      exportedBy: user?.displayName,
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

  const importData = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (!data.tasks || !Array.isArray(data.tasks)) {
          addNotif('Invalid backup file format', 'error');
          return;
        }
        
        let importedCount = 0;
        const tasksRef = ref(db, 'tasks');
        
        for (const task of data.tasks) {
          const { id, ...taskData } = task;
          await push(tasksRef, taskData);
          importedCount++;
        }
        
        addNotif(`Imported ${importedCount} tasks`, 'success');
        setShowDataModal(false);
      } catch (err) {
        addNotif('Failed to parse backup file', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    todayPending: tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0] && !t.completed).length,
    userCreated: tasks.filter(t => t.createdByUid === user?.uid).length,
    userCompleted: tasks.filter(t => t.completedByUid === user?.uid).length
  };

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const workStats = getWorkStats();

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'today') return t.dueDate === new Date().toISOString().split('T')[0];
    if (filter === 'mine') return t.createdByUid === user?.uid;
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

  const getOnlineMembers = () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return teamMembers.filter(m => m.lastSeen > fiveMinutesAgo);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
        <div className="relative bg-zinc-900/80 backdrop-blur-xl p-10 rounded-3xl border border-zinc-800 shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-indigo-500/25">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TaskFlow</h1>
          <p className="text-zinc-400 mb-8">Collaborative task management for teams</p>
          
          <button 
            onClick={signInWithGoogle}
            className="w-full px-5 py-4 bg-white text-zinc-900 rounded-xl hover:bg-zinc-100 transition-all font-semibold text-lg flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          
          <p className="text-zinc-500 text-sm mt-6">
            Sign in to sync tasks with your team in real-time
          </p>
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
            className={`px-4 py-3 rounded-xl shadow-xl backdrop-blur-xl border ${
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
                <p className="text-zinc-500 text-sm">Export or import your data</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-zinc-800/50 rounded-2xl p-5 border border-zinc-700/50">
                <p className="text-zinc-400 text-sm font-medium mb-3">Current Data</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">{tasks.length}</div>
                    <div className="text-xs text-zinc-500">Team Tasks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{workSessions.length}</div>
                    <div className="text-xs text-zinc-500">Your Sessions</div>
                  </div>
                </div>
              </div>

              <button 
                onClick={exportData}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-4 hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-3 font-semibold shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-5 h-5" />
                Download Backup
              </button>
              
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
              
              <p className="text-zinc-500 text-xs text-center mt-4">
                Data syncs in real-time with your team via Firebase
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl max-w-md w-full relative">
            <button onClick={() => setShowTeam(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Team Members</h2>
                <p className="text-zinc-500 text-sm">{getOnlineMembers().length} online now</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {teamMembers.map(member => {
                const isOnline = member.lastSeen > Date.now() - 5 * 60 * 1000;
                const isCurrentUser = member.uid === user.uid;
                return (
                  <div key={member.uid} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                    <div className="relative">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                          {member.name?.charAt(0)}
                        </div>
                      )}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-800 ${isOnline ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {member.name} {isCurrentUser && <span className="text-zinc-500">(you)</span>}
                      </p>
                      <p className="text-zinc-500 text-xs">{member.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg ${isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-400'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                );
              })}
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
              <p className="text-zinc-500 text-sm">Welcome, <span className="text-indigo-400">{user.displayName}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Online indicator */}
            <button onClick={() => setShowTeam(true)} className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700/50 transition-all">
              <div className="flex -space-x-2">
                {getOnlineMembers().slice(0, 3).map(m => (
                  m.photo ? (
                    <img key={m.uid} src={m.photo} alt={m.name} className="w-6 h-6 rounded-full border-2 border-zinc-800" />
                  ) : (
                    <div key={m.uid} className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-zinc-800 flex items-center justify-center text-white text-xs font-semibold">
                      {m.name?.charAt(0)}
                    </div>
                  )
                ))}
              </div>
              <span className="text-emerald-400 text-sm font-medium">{getOnlineMembers().length} online</span>
            </button>
            
            <button onClick={() => setShowDataModal(true)} className="p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700/50 transition-all group">
              <Download className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
            </button>
            <button onClick={() => setShowTimer(true)} className="p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700/50 transition-all group">
              <Clock className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
            </button>
            <button onClick={() => setShowStats(true)} className="p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700/50 transition-all group">
              <BarChart3 className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
            </button>
            <button onClick={handleSignOut} className="p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl border border-zinc-700/50 transition-all group">
              <LogOut className="w-5 h-5 text-zinc-400 group-hover:text-red-400 transition-colors" />
            </button>
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
            <span className="text-sm font-medium text-zinc-400">Team Progress</span>
            <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out rounded-full" 
              style={{ width: `${progress}%` }} 
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
          {['all', 'active', 'today', 'mine', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {f === 'mine' ? 'My Tasks' : f.charAt(0).toUpperCase() + f.slice(1)}
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
          TaskFlow • Real-time collaborative task management
        </p>
      </div>
    </div>
  );
}
