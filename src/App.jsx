import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, Settings, Plus, Trash2, Check, Calendar, Bell, MessageSquare, Users, X, Send, LogOut, Download, BarChart3, Activity, UserCircle, Heart, Dumbbell, Pill, Apple, AlertTriangle, RefreshCw, Wifi, Award, Target, Flame, Trophy, ChevronLeft, ChevronRight, Search, SortAsc, SortDesc, FileText, Timer, PlayCircle, PauseCircle, StopCircle, Paperclip } from 'lucide-react';

const TaskFlowDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const [currentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(currentDate.getDate());
  const [calendarMonth, setCalendarMonth] = useState(currentDate.getMonth());
  const [calendarYear, setCalendarYear] = useState(currentDate.getFullYear());
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [teamNote, setTeamNote] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(8 * 60 * 60);
  const [customGoalHours, setCustomGoalHours] = useState(8);
  const [showActivityTimeline, setShowActivityTimeline] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTeamView, setShowTeamView] = useState(false);
  const [currentTimerTask, setCurrentTimerTask] = useState(null);
  const [showHealthTracker, setShowHealthTracker] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [showTeamChat, setShowTeamChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedNewTaskDate, setSelectedNewTaskDate] = useState(new Date());
  const [newTaskDateMonth, setNewTaskDateMonth] = useState(new Date().getMonth());
  const [newTaskDateYear, setNewTaskDateYear] = useState(new Date().getFullYear());
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [pomodoroType, setPomodoroType] = useState('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [timerCategory, setTimerCategory] = useState('General Work');
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [tempGoalHours, setTempGoalHours] = useState(8);
  
  const [sharedTasks, setSharedTasks] = useState([]);
  const [sharedTeamNotes, setSharedTeamNotes] = useState([]);
  const [sharedTeamMembers, setSharedTeamMembers] = useState([]);
  const [sharedActivityFeed, setSharedActivityFeed] = useState([]);
  const [sharedWorkLogs, setSharedWorkLogs] = useState([]);
  const [sharedHealthLogs, setSharedHealthLogs] = useState([]);
  const [sharedChatMessages, setSharedChatMessages] = useState([]);
  
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'work',
    priority: 'medium',
    assignee: '',
    estimatedTime: '60',
    description: ''
  });

  const [comment, setComment] = useState('');
  const appVersion = "1.0.0";
  const appName = "TaskFlow";

  const saveSharedData = async (key, data) => {
    try {
      setSyncing(true);
      await window.storage.set(`taskflow_${key}`, JSON.stringify(data), true);
      setSyncing(false);
    } catch (error) {
      localStorage.setItem(`taskflow_${key}`, JSON.stringify(data));
      setSyncing(false);
    }
  };

  const loadSharedData = async (key, defaultValue = []) => {
    try {
      const result = await window.storage.get(`taskflow_${key}`, true);
      if (result && result.value) return JSON.parse(result.value);
      return defaultValue;
    } catch (error) {
      const localData = localStorage.getItem(`taskflow_${key}`);
      return localData ? JSON.parse(localData) : defaultValue;
    }
  };

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      const savedUser = localStorage.getItem('taskflow_user');
      if (savedUser) setUser(JSON.parse(savedUser));
      await loadAllSharedData();
      setLoading(false);
    };
    initApp();
    const syncInterval = setInterval(() => { if (user) loadAllSharedData(); }, 5000);
    return () => clearInterval(syncInterval);
  }, []);

  const loadAllSharedData = async () => {
    const [tasks, notes, members, activity, workLogs, healthLogs, chat] = await Promise.all([
      loadSharedData('tasks', []),
      loadSharedData('team_notes', []),
      loadSharedData('team_members', []),
      loadSharedData('activity_feed', []),
      loadSharedData('work_logs', []),
      loadSharedData('health_logs', []),
      loadSharedData('chat_messages', [])
    ]);
    setSharedTasks(tasks);
    setSharedTeamNotes(notes);
    setSharedTeamMembers(members);
    setSharedActivityFeed(activity);
    setSharedWorkLogs(workLogs);
    setSharedHealthLogs(healthLogs);
    setSharedChatMessages(chat);
  };

  useEffect(() => { if (user) saveSharedData('tasks', sharedTasks); }, [sharedTasks]);
  useEffect(() => { if (user) saveSharedData('team_notes', sharedTeamNotes); }, [sharedTeamNotes]);
  useEffect(() => { if (user) saveSharedData('team_members', sharedTeamMembers); }, [sharedTeamMembers]);
  useEffect(() => { if (user) saveSharedData('activity_feed', sharedActivityFeed); }, [sharedActivityFeed]);
  useEffect(() => { if (user) saveSharedData('work_logs', sharedWorkLogs); }, [sharedWorkLogs]);
  useEffect(() => { if (user) saveSharedData('health_logs', sharedHealthLogs); }, [sharedHealthLogs]);
  useEffect(() => { if (user) saveSharedData('chat_messages', sharedChatMessages); }, [sharedChatMessages]);

  useEffect(() => {
    if (user) {
      const updateStatus = () => {
        const currentTask = currentTimerTask ? sharedTasks.find(t => t.id === currentTimerTask)?.title : null;
        setSharedTeamMembers(prev => {
          const exists = prev.find(m => m.odii === user.odii);
          if (exists) return prev.map(m => m.odii === user.odii ? { ...m, lastActive: new Date().toISOString(), isOnline: true, currentTask } : m);
          return [...prev, { ...user, lastActive: new Date().toISOString(), isOnline: true, currentTask, totalHoursWorked: 0, tasksCompleted: 0 }];
        });
      };
      updateStatus();
      const interval = setInterval(updateStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [user, currentTimerTask]);

  const signInWithGoogle = async () => {
    const userName = prompt('Enter your full name:');
    if (!userName?.trim()) return;
    const userEmail = prompt('Enter your email:');
    if (!userEmail?.trim()) return;
    
    const newUser = {
      odii: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      displayName: userName.trim(),
      email: userEmail.trim(),
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=f97316&color=fff`,
      joinedAt: new Date().toISOString()
    };
    
    setUser(newUser);
    localStorage.setItem('taskflow_user', JSON.stringify(newUser));
    addActivity(`🎉 ${userName} joined the team!`);
    await loadAllSharedData();
  };

  const signOut = () => {
    setSharedTeamMembers(prev => prev.map(m => m.odii === user?.odii ? { ...m, isOnline: false } : m));
    addActivity(`👋 ${user?.displayName} went offline`);
    setUser(null);
    localStorage.removeItem('taskflow_user');
  };

  const addActivity = (message, type = 'general') => {
    const activity = { id: Date.now(), message, type, user: user?.displayName || 'System', timestamp: new Date().toISOString() };
    setSharedActivityFeed(prev => [activity, ...prev].slice(0, 100));
  };

  useEffect(() => {
    let interval;
    if (isTimerRunning) interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    let interval;
    if (isPomodoroRunning) {
      interval = setInterval(() => {
        if (pomodoroSeconds === 0) {
          if (pomodoroMinutes === 0) {
            setIsPomodoroRunning(false);
            if (pomodoroType === 'work') {
              setPomodoroCount(prev => prev + 1);
              setPomodoroType((pomodoroCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak');
              setPomodoroMinutes((pomodoroCount + 1) % 4 === 0 ? 15 : 5);
            } else {
              setPomodoroType('work');
              setPomodoroMinutes(25);
            }
          } else {
            setPomodoroMinutes(prev => prev - 1);
            setPomodoroSeconds(59);
          }
        } else {
          setPomodoroSeconds(prev => prev - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroMinutes, pomodoroSeconds, pomodoroType, pomodoroCount]);

  useEffect(() => {
    const notifs = sharedTasks.filter(task => 
      task.status !== 'completed' && (task.assignee === user?.displayName || !task.assignee)
    ).map(task => {
      const taskDate = new Date(task.dueDate);
      if (taskDate < currentDate && task.status !== 'completed') return { id: `overdue-${task.id}`, type: 'overdue', message: `"${task.title}" is OVERDUE!` };
      if (taskDate.toDateString() === currentDate.toDateString()) return { id: `today-${task.id}`, type: 'today', message: `"${task.title}" is due TODAY!` };
      return null;
    }).filter(Boolean);
    setNotifications(notifs);
  }, [sharedTasks, user]);

  const priorityColors = {
    urgent: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
    high: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' },
    low: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' }
  };

  const categoryColors = {
    work: { bg: 'bg-blue-600', icon: '💼' },
    design: { bg: 'bg-purple-600', icon: '🎨' },
    meeting: { bg: 'bg-pink-600', icon: '👥' },
    development: { bg: 'bg-cyan-600', icon: '💻' },
    personal: { bg: 'bg-emerald-600', icon: '🏠' },
    learning: { bg: 'bg-indigo-600', icon: '📚' }
  };

  const stats = useMemo(() => ({
    total: sharedTasks.length,
    done: sharedTasks.filter(t => t.status === 'completed').length,
    pending: sharedTasks.filter(t => t.status === 'pending').length,
    dueToday: sharedTasks.filter(t => new Date(t.dueDate).toDateString() === currentDate.toDateString() && t.status !== 'completed').length,
    myTasks: sharedTasks.filter(t => t.assignee === user?.displayName).length,
    overdue: sharedTasks.filter(t => new Date(t.dueDate) < currentDate && t.status !== 'completed').length
  }), [sharedTasks, user, currentDate]);

  const logHealth = (type) => {
    const today = new Date().toISOString().split('T')[0];
    if (!sharedHealthLogs.find(log => log.date === today && log.type === type && log.user === user?.displayName)) {
      setSharedHealthLogs(prev => [...prev, { id: Date.now(), type, date: today, user: user?.displayName }]);
      addActivity(`💪 ${user?.displayName} logged ${type}`, 'health');
    }
  };

  const removeHealthLog = (type) => {
    const today = new Date().toISOString().split('T')[0];
    setSharedHealthLogs(prev => prev.filter(log => !(log.date === today && log.type === type && log.user === user?.displayName)));
  };

  const isHealthLoggedToday = (type) => {
    const today = new Date().toISOString().split('T')[0];
    return sharedHealthLogs.some(log => log.date === today && log.type === type && log.user === user?.displayName);
  };

  const getHealthCount = (type, period = 'week') => {
    const now = new Date();
    const startDate = period === 'week' ? new Date(now.setDate(now.getDate() - now.getDay())) : new Date(now.getFullYear(), now.getMonth(), 1);
    return sharedHealthLogs.filter(log => log.type === type && new Date(log.date) >= startDate && log.user === user?.displayName).length;
  };

  const handleToggleTaskComplete = (taskId) => {
    setSharedTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        if (newStatus === 'completed') {
          addActivity(`✅ ${user?.displayName} completed "${task.title}"`, 'task');
          setSharedTeamMembers(members => members.map(m => m.odii === user?.odii ? { ...m, tasksCompleted: (m.tasksCompleted || 0) + 1 } : m));
        }
        return { ...task, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : null, completedBy: newStatus === 'completed' ? user?.displayName : null };
      }
      return task;
    }));
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    const task = {
      id: Date.now(),
      title: newTask.title,
      category: newTask.category,
      priority: newTask.priority,
      dueDate: selectedNewTaskDate.toISOString(),
      status: 'pending',
      assignee: newTask.assignee || '',
      estimatedTime: parseInt(newTask.estimatedTime) || 60,
      description: newTask.description,
      comments: [],
      completedAt: null,
      timeSpent: 0,
      createdAt: new Date().toISOString(),
      createdBy: user?.displayName
    };
    setSharedTasks(prev => [...prev, task]);
    addActivity(`📝 ${user?.displayName} created "${task.title}"${task.assignee ? ` → ${task.assignee}` : ''}`, 'task');
    setNewTask({ title: '', category: 'work', priority: 'medium', assignee: '', estimatedTime: '60', description: '' });
    setSelectedNewTaskDate(new Date());
    setShowNewTaskForm(false);
  };

  const handleDeleteTask = (taskId) => {
    const task = sharedTasks.find(t => t.id === taskId);
    if (confirm(`Delete "${task?.title}"?`)) {
      setSharedTasks(prev => prev.filter(t => t.id !== taskId));
      addActivity(`🗑️ ${user?.displayName} deleted "${task?.title}"`, 'task');
    }
  };

  const handleAssignTask = (taskId, assigneeName) => {
    setSharedTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        addActivity(`👤 ${user?.displayName} assigned "${task.title}" to ${assigneeName || 'Unassigned'}`, 'task');
        return { ...task, assignee: assigneeName };
      }
      return task;
    }));
  };

  const handleAddComment = (taskId) => {
    if (!comment.trim()) return;
    setSharedTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        addActivity(`💬 ${user?.displayName} commented on "${task.title}"`, 'comment');
        return { ...task, comments: [...task.comments, { id: Date.now(), user: user?.displayName, text: comment, time: new Date().toLocaleString() }] };
      }
      return task;
    }));
    setComment('');
  };

  const handleAddTeamNote = () => {
    if (!teamNote.trim()) return;
    setSharedTeamNotes(prev => [{ id: Date.now(), text: teamNote, user: user?.displayName, timestamp: new Date().toISOString() }, ...prev]);
    addActivity(`📌 ${user?.displayName} added a note`, 'note');
    setTeamNote('');
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    setSharedChatMessages(prev => [...prev, { id: Date.now(), text: chatMessage, user: user?.displayName, timestamp: new Date().toISOString() }]);
    setChatMessage('');
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      const workEntry = {
        id: Date.now(),
        duration: timerSeconds,
        date: new Date().toISOString().split('T')[0],
        taskId: currentTimerTask,
        taskTitle: currentTimerTask ? sharedTasks.find(t => t.id === currentTimerTask)?.title : timerCategory,
        user: user?.displayName
      };
      setSharedWorkLogs(prev => [...prev, workEntry]);
      if (currentTimerTask) setSharedTasks(prev => prev.map(task => task.id === currentTimerTask ? { ...task, timeSpent: (task.timeSpent || 0) + timerSeconds } : task));
      setSharedTeamMembers(members => members.map(m => m.odii === user?.odii ? { ...m, totalHoursWorked: (m.totalHoursWorked || 0) + timerSeconds } : m));
      addActivity(`⏱️ ${user?.displayName} logged ${formatTime(timerSeconds)}`, 'time');
      setTimerSeconds(0);
      setCurrentTimerTask(null);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleSaveTimerSettings = () => {
    setDailyTarget(tempGoalHours * 3600);
    setCustomGoalHours(tempGoalHours);
    setShowTimerSettings(false);
  };

  const formatTime = (seconds) => `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const formatMinutesShort = (mins) => mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h ${mins%60}m`;

  const getRemainingTime = (task) => {
    const estimated = (task.estimatedTime || 60) * 60;
    const spent = task.timeSpent || 0;
    const remaining = estimated - spent;
    return { seconds: remaining, text: formatTime(Math.abs(remaining)), isOvertime: remaining <= 0 };
  };

  const getTotalWorkedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return sharedWorkLogs.filter(log => log.date === today && log.user === user?.displayName)
      .reduce((sum, log) => sum + log.duration, 0) + (isTimerRunning ? timerSeconds : 0);
  };

  const getWorkDataByDay = (days = 7) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = sharedWorkLogs.filter(log => log.date === dateStr && log.user === user?.displayName);
      data.push({ date: date.toLocaleDateString('en-US', { weekday: 'short' }), hours: parseFloat((dayLogs.reduce((sum, log) => sum + log.duration, 0) / 3600).toFixed(1)) });
    }
    return data;
  };

  const getTasksByCategory = () => Object.entries(sharedTasks.reduce((acc, task) => { acc[task.category] = (acc[task.category] || 0) + 1; return acc; }, {})).map(([name, count]) => ({ name, count, color: categoryColors[name]?.bg || 'bg-gray-500' }));
  const getTasksByPriority = () => ['urgent', 'high', 'medium', 'low'].map(p => ({ name: p, count: sharedTasks.filter(t => t.priority === p).length, color: priorityColors[p]?.bg }));

  const getDaysInMonth = (month, year) => ({ firstDay: new Date(year, month, 1).getDay(), daysInMonth: new Date(year, month + 1, 0).getDate() });
  const getTasksForDate = (day, month = calendarMonth, year = calendarYear) => sharedTasks.filter(task => new Date(task.dueDate).toDateString() === new Date(year, month, day).toDateString());

  const renderCalendar = (isDatePicker = false, onSelectDate = null, month = calendarMonth, year = calendarYear) => {
    const { firstDay: fd, daysInMonth: dim } = getDaysInMonth(month, year);
    const blanks = Array(fd).fill(null).map((_, i) => <div key={`b-${i}`} className="h-8"></div>);
    const days = Array(dim).fill(null).map((_, i) => {
      const d = i + 1;
      const dayTasks = getTasksForDate(d, month, year);
      const isToday = d === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
      const isSelected = isDatePicker 
        ? d === selectedNewTaskDate.getDate() && month === selectedNewTaskDate.getMonth() && year === selectedNewTaskDate.getFullYear()
        : d === selectedCalendarDate && month === calendarMonth && year === calendarYear;

      return (
        <div key={d} onClick={() => isDatePicker && onSelectDate ? onSelectDate(new Date(year, month, d)) : setSelectedCalendarDate(d)}
          onMouseEnter={() => !isDatePicker && setHoveredDate(d)} onMouseLeave={() => setHoveredDate(null)}
          className={`h-8 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all relative text-xs ${
            isSelected ? 'bg-orange-500 text-white scale-105' : isToday ? 'bg-orange-500/30 text-orange-300 border border-orange-500' : 'hover:bg-gray-700'
          }`}>
          <span className="font-medium">{d}</span>
          {!isDatePicker && dayTasks.length > 0 && (
            <div className="flex gap-0.5 absolute bottom-0.5">
              {dayTasks.slice(0,3).map((t,idx) => <div key={idx} className={`w-1 h-1 rounded-full ${priorityColors[t.priority].bg}`}></div>)}
            </div>
          )}
          {!isDatePicker && hoveredDate === d && dayTasks.length > 0 && (
            <div className="absolute z-30 bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-xl min-w-[100px]">
              <div className="text-[9px] font-bold text-orange-400 mb-1">{dayTasks.length} task(s)</div>
              {dayTasks.slice(0,3).map((t,i) => <div key={i} className="text-[8px] text-gray-300 truncate">• {t.title}</div>)}
            </div>
          )}
        </div>
      );
    });
    return [...blanks, ...days];
  };

  const MiniBarChart = ({ data, height = 60 }) => {
    const max = Math.max(...data.map(d => d.hours), 1);
    return (
      <div className="flex items-end justify-between gap-1" style={{ height }}>
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t" style={{ height: `${Math.max((item.hours / max) * 100, 5)}%` }}></div>
            <span className="text-[8px] text-gray-500 mt-1">{item.date}</span>
          </div>
        ))}
      </div>
    );
  };

  const DonutChart = ({ data, size = 80 }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
    let cumulative = 0;
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          {data.map((item, idx) => {
            const pct = (item.count / total) * 100;
            const offset = cumulative;
            cumulative += pct;
            return <circle key={idx} cx="18" cy="18" r="14" fill="none" strokeWidth="4" className={item.color?.replace('bg-', 'stroke-') || 'stroke-gray-500'} strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset} transform="rotate(-90 18 18)" />;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold">{total}</span></div>
      </div>
    );
  };

  const NavButton = ({ icon: Icon, label, badge, onClick, active }) => (
    <div className="relative group">
      <button onClick={onClick} className={`p-2 rounded-lg transition-all ${active ? 'bg-orange-500' : 'hover:bg-gray-700'}`}>
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        {badge > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>}
      </button>
      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">{label}</div>
    </div>
  );

  const filteredTasks = useMemo(() => {
    let tasks = [...sharedTasks];
    if (selectedFilter === 'Today') tasks = tasks.filter(t => new Date(t.dueDate).toDateString() === currentDate.toDateString());
    else if (selectedFilter === 'My Tasks') tasks = tasks.filter(t => t.assignee === user?.displayName);
    else if (selectedFilter === 'Active') tasks = tasks.filter(t => t.status !== 'completed');
    else if (selectedFilter === 'Completed') tasks = tasks.filter(t => t.status === 'completed');
    if (searchQuery) tasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    tasks.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'dueDate') cmp = new Date(a.dueDate) - new Date(b.dueDate);
      else if (sortBy === 'priority') { const o = { urgent: 0, high: 1, medium: 2, low: 3 }; cmp = o[a.priority] - o[b.priority]; }
      else if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return tasks;
  }, [sharedTasks, selectedFilter, searchQuery, sortBy, sortOrder, user, currentDate]);

  const selectedDateTasks = getTasksForDate(selectedCalendarDate);
  const onlineMembers = sharedTeamMembers.filter(m => m.isOnline || (new Date() - new Date(m.lastActive)) < 60000);
  const pendingTasks = sharedTasks.filter(t => t.status !== 'completed');
  const dailyGoalProgress = Math.min((getTotalWorkedToday() / dailyTarget) * 100, 100);

  // Loading Screen
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-bold text-orange-500 mb-2">{appName}</h2>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="fixed inset-0 bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <span className="text-4xl">⚡</span>
            </div>
            <h1 className="text-3xl font-black mb-2 text-orange-500">{appName}</h1>
            <p className="text-gray-400">v{appVersion}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <button onClick={signInWithGoogle} className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 mb-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
            {sharedTeamMembers.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                <p className="text-xs text-gray-500 mb-2">Team Members ({sharedTeamMembers.length})</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {sharedTeamMembers.slice(0, 5).map(m => (
                    <div key={m.odii} className="flex items-center gap-1 bg-gray-700 px-2 py-1 rounded-full text-xs">
                      <div className={`w-2 h-2 rounded-full ${m.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      {m.displayName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header - 56px height */}
      <header className="h-14 bg-gray-800 flex items-center justify-between px-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">⚡</span>
          </div>
          <span className="text-orange-500 font-bold text-lg">{appName}</span>
          <span className="bg-orange-600 text-xs px-2 py-0.5 rounded">v{appVersion}</span>
          {syncing && <span className="flex items-center gap-1 text-blue-400 text-xs"><RefreshCw size={12} className="animate-spin" /> Syncing</span>}
        </div>
        <span className="text-gray-400 text-sm">Welcome, {user.displayName}</span>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded mr-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm">{onlineMembers.length} online</span>
          </div>
          <NavButton icon={Users} label="Team" onClick={() => setShowTeamView(!showTeamView)} active={showTeamView} />
          <NavButton icon={Bell} label="Alerts" badge={notifications.length} onClick={() => setShowNotifications(!showNotifications)} />
          <NavButton icon={Timer} label="Pomodoro" onClick={() => setShowPomodoro(!showPomodoro)} active={showPomodoro} />
          <NavButton icon={BarChart3} label="Analytics" onClick={() => setShowAnalytics(!showAnalytics)} active={showAnalytics} />
          <NavButton icon={Download} label="Export" onClick={() => {}} />
          <NavButton icon={Settings} label="Settings" onClick={() => setShowSettings(!showSettings)} active={showSettings} />
          <button onClick={signOut} className="p-2 rounded-lg hover:bg-gray-700"><LogOut size={18} className="text-gray-400" /></button>
        </div>
      </header>

      {/* Modals */}
      {/* Timer Settings Modal */}
      {showTimerSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-80">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><Settings size={16} className="text-orange-500" /> Timer Settings</h3>
              <button onClick={() => setShowTimerSettings(false)}><X size={16} className="text-gray-400 hover:text-white" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Daily Goal (hours)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="24" 
                  value={tempGoalHours} 
                  onChange={(e) => setTempGoalHours(parseInt(e.target.value) || 8)} 
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Default Category</label>
                <select 
                  value={timerCategory} 
                  onChange={(e) => setTimerCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="General Work">General Work</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Learning">Learning</option>
                </select>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Today's Progress</div>
                <div className="text-lg font-bold text-orange-400">{formatTime(getTotalWorkedToday())}</div>
                <div className="text-[10px] text-gray-500">of {tempGoalHours}h goal</div>
              </div>
              <button 
                onClick={handleSaveTimerSettings}
                className="w-full bg-orange-500 hover:bg-orange-600 py-2 rounded-lg font-semibold text-sm"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pomodoro Modal */}
      {showPomodoro && (
        <div className="absolute top-16 right-4 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-3 rounded-t-xl flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-2"><Timer size={16} /> Pomodoro</h3>
            <button onClick={() => setShowPomodoro(false)}><X size={16} /></button>
          </div>
          <div className="p-4 text-center">
            <div className={`text-4xl font-mono font-bold mb-2 ${pomodoroType === 'work' ? 'text-red-400' : 'text-green-400'}`}>
              {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-400 mb-3">{pomodoroType === 'work' ? '🔥 Focus' : pomodoroType === 'shortBreak' ? '☕ Short Break' : '🌴 Long Break'}</div>
            <div className="flex justify-center gap-2 mb-3">
              <button onClick={() => setIsPomodoroRunning(!isPomodoroRunning)} className={`p-2 rounded-full ${isPomodoroRunning ? 'bg-yellow-500' : 'bg-green-500'}`}>
                {isPomodoroRunning ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
              </button>
              <button onClick={() => { setIsPomodoroRunning(false); setPomodoroMinutes(25); setPomodoroSeconds(0); setPomodoroType('work'); }} className="p-2 rounded-full bg-red-500">
                <StopCircle size={20} />
              </button>
            </div>
            <div className="flex justify-center gap-1">
              {[...Array(4)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < pomodoroCount % 4 ? 'bg-red-500' : 'bg-gray-700'}`}></div>)}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">{pomodoroCount} completed</div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="absolute top-16 right-4 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-sm">🔔 Notifications</h3>
            <button onClick={() => setShowNotifications(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs">All caught up! ✨</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-2 border-b border-gray-700 text-xs ${n.type === 'overdue' ? 'bg-red-900/20' : 'bg-orange-900/20'}`}>{n.message}</div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showTeamView && (
        <div className="absolute top-16 right-4 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
            <h3 className="font-bold text-sm flex items-center gap-2"><Users size={16} className="text-orange-500" /> Team ({sharedTeamMembers.length})</h3>
            <button onClick={() => setShowTeamView(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="p-3 space-y-2">
            {sharedTeamMembers.map(member => {
              const isMe = member.odii === user?.odii;
              const memberTasks = sharedTasks.filter(t => t.assignee === member.displayName);
              const isOnline = member.isOnline || (new Date() - new Date(member.lastActive)) < 60000;
              return (
                <div key={member.odii} className={`rounded-lg p-2 ${isMe ? 'bg-orange-900/20 border border-orange-800/50' : 'bg-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative">
                      <img src={member.photoURL} className="w-8 h-8 rounded-full" alt="" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-gray-800 ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-xs">{member.displayName} {isMe && <span className="text-[9px] text-orange-400">(You)</span>}</div>
                      <div className="text-[10px] text-gray-400">{member.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center text-[9px]">
                    <div className="bg-black/30 rounded p-1"><div className="font-bold text-orange-400">{((member.totalHoursWorked || 0) / 3600).toFixed(1)}h</div>Hours</div>
                    <div className="bg-black/30 rounded p-1"><div className="font-bold text-green-400">{memberTasks.filter(t => t.status === 'completed').length}</div>Done</div>
                    <div className="bg-black/30 rounded p-1"><div className="font-bold text-yellow-400">{memberTasks.filter(t => t.status === 'pending').length}</div>Pending</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="absolute top-16 right-4 w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-[500px] overflow-y-auto">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
            <h3 className="font-bold text-sm flex items-center gap-2"><BarChart3 size={16} className="text-orange-500" /> Analytics</h3>
            <button onClick={() => setShowAnalytics(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {[{ l: 'Total', v: stats.total, c: 'blue' }, { l: 'Done', v: stats.done, c: 'green' }, { l: 'Pending', v: stats.pending, c: 'yellow' }, { l: 'Overdue', v: stats.overdue, c: 'red' }].map(s => (
                <div key={s.l} className={`bg-${s.c}-600/20 rounded-lg p-2 text-center`}><div className="text-lg font-bold">{s.v}</div><div className="text-[9px] text-gray-400">{s.l}</div></div>
              ))}
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <h4 className="text-xs font-bold mb-2 text-orange-400">📈 Weekly Hours</h4>
              <MiniBarChart data={getWorkDataByDay(7)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-700 rounded-lg p-2">
                <h4 className="text-[10px] font-bold mb-1 text-orange-400">By Category</h4>
                <div className="flex items-center gap-2">
                  <DonutChart data={getTasksByCategory()} size={60} />
                  <div className="space-y-0.5 text-[8px]">{getTasksByCategory().map(c => <div key={c.name} className="flex items-center gap-1"><div className={`w-2 h-2 rounded ${c.color}`}></div>{c.name}: {c.count}</div>)}</div>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-2">
                <h4 className="text-[10px] font-bold mb-1 text-orange-400">By Priority</h4>
                <div className="flex items-center gap-2">
                  <DonutChart data={getTasksByPriority()} size={60} />
                  <div className="space-y-0.5 text-[8px]">{getTasksByPriority().map(p => <div key={p.name} className="flex items-center gap-1"><div className={`w-2 h-2 rounded ${p.color}`}></div>{p.name}: {p.count}</div>)}</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <h4 className="text-xs font-bold mb-1 text-orange-400">🏆 Completion Rate</h4>
              <div className="text-3xl font-black text-green-400">{stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute top-16 right-4 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-sm">⚙️ Settings</h3>
            <button onClick={() => setShowSettings(false)}><X size={16} className="text-gray-400" /></button>
          </div>
          <div className="p-3 space-y-3">
            <div className="bg-gray-700 rounded-lg p-3 flex items-center gap-2">
              <img src={user.photoURL} className="w-10 h-10 rounded-full" alt="" />
              <div><div className="font-bold text-sm">{user.displayName}</div><div className="text-[10px] text-gray-400">{user.email}</div></div>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <h4 className="text-xs font-bold mb-2 text-orange-400">Daily Goal (hours)</h4>
              <div className="flex gap-2">
                <input type="number" value={customGoalHours} onChange={(e) => setCustomGoalHours(parseInt(e.target.value) || 8)} className="flex-1 bg-gray-600 rounded px-2 py-1.5 text-xs" />
                <button onClick={() => setDailyTarget(customGoalHours * 3600)} className="px-3 py-1.5 bg-orange-500 rounded text-xs font-bold">Set</button>
              </div>
            </div>
            <button onClick={() => loadAllSharedData()} className="w-full bg-blue-500/20 text-blue-400 p-2 rounded-lg text-xs flex items-center justify-center gap-2"><RefreshCw size={14} /> Force Sync</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - 260px */}
        <aside className="w-[260px] bg-gray-800 p-3 flex flex-col gap-3 border-r border-gray-700 overflow-y-auto flex-shrink-0">
          {/* Time Tracker */}
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-orange-500">
                <Clock size={16} />
                <span className="font-semibold text-sm">Time Tracker</span>
              </div>
              <button 
                onClick={() => {
                  setTempGoalHours(customGoalHours);
                  setShowTimerSettings(true);
                }}
                className="p-1 rounded hover:bg-gray-700 transition-colors"
              >
                <Settings size={14} className="text-gray-400 hover:text-white" />
              </button>
            </div>
            
            <div className="text-center mb-3">
              <div className="text-4xl font-mono text-orange-500 mb-1">{formatTime(isTimerRunning ? timerSeconds : 0)}</div>
              <div className="text-gray-500 text-xs">{isTimerRunning ? (currentTimerTask ? sharedTasks.find(t => t.id === currentTimerTask)?.title : timerCategory) : 'Ready to Start'}</div>
            </div>

            {!isTimerRunning && (
              <select
                value={currentTimerTask || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setCurrentTimerTask(parseInt(e.target.value));
                  } else {
                    setCurrentTimerTask(null);
                  }
                }}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 mb-3 text-sm"
              >
                <option value="">General Work</option>
                {sharedTasks.filter(t => t.status === 'pending').map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            )}

            <button
              onClick={toggleTimer}
              className={`w-full py-2.5 rounded-lg font-semibold transition-colors ${
                isTimerRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
            </button>

            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Daily Goal</span>
                <span className="text-gray-400">{Math.round(dailyGoalProgress)}%</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full">
                <div
                  className="h-1.5 bg-gradient-to-r from-orange-500 to-green-500 rounded-full transition-all"
                  style={{ width: `${dailyGoalProgress}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">{formatTime(getTotalWorkedToday())} / {formatTime(dailyTarget)}</div>
            </div>
          </div>

          {/* Health Tracker */}
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-400 mb-3">
              <Heart size={16} />
              <span className="font-semibold text-sm">Health Tracker</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'exercise', icon: Dumbbell, label: 'Exercise', color: 'green' },
                { type: 'protein', icon: Apple, label: 'Protein', color: 'blue' },
                { type: 'multivitamin', icon: Pill, label: 'Vitamins', color: 'purple' }
              ].map(item => (
                <button
                  key={item.type}
                  onClick={() => isHealthLoggedToday(item.type) ? removeHealthLog(item.type) : logHealth(item.type)}
                  className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center ${
                    isHealthLoggedToday(item.type)
                      ? `bg-${item.color}-500/20 border-${item.color}-500`
                      : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <item.icon size={18} className={isHealthLoggedToday(item.type) ? `text-${item.color}-400` : 'text-gray-400'} />
                  <span className="text-[8px] mt-1">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1 mt-2 text-center text-[8px]">
              <div><span className="text-green-400 font-bold">{getHealthCount('exercise')}/7</span> week</div>
              <div><span className="text-blue-400 font-bold">{getHealthCount('protein')}/7</span> week</div>
              <div><span className="text-purple-400 font-bold">{getHealthCount('multivitamin')}/7</span> week</div>
            </div>
          </div>

          {/* Team Notes */}
          <div className="bg-gray-900 rounded-lg p-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <MessageSquare size={16} />
              <span className="font-semibold text-sm">Team Notes</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-2 min-h-0">
              {sharedTeamNotes.slice(0, 4).map(note => (
                <div key={note.id} className="bg-gray-800 rounded p-2">
                  <p className="text-xs text-gray-300 mb-1 line-clamp-2">{note.text}</p>
                  <div className="flex justify-between text-[9px] text-gray-500">
                    <span>{note.user}</span>
                    <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {sharedTeamNotes.length === 0 && (
                <div className="text-center text-gray-500 text-xs py-4">No notes yet</div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={teamNote}
                onChange={(e) => setTeamNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-xs"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTeamNote()}
              />
              <button
                onClick={handleAddTeamNote}
                className="bg-orange-500 hover:bg-orange-600 p-1.5 rounded"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Larger */}
        <main className="flex-1 p-4 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-500 text-xs mb-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Total
              </div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-500 text-xs mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Done
              </div>
              <div className="text-3xl font-bold">{stats.done}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-500 text-xs mb-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                Pending
              </div>
              <div className="text-3xl font-bold">{stats.pending}</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-500 text-xs mb-1">
                <Calendar size={12} />
                Due Today
              </div>
              <div className="text-3xl font-bold">{stats.dueToday}</div>
            </div>
          </div>

          {/* Team Progress */}
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Team Progress</span>
              <span className="text-orange-500 text-sm">{stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full">
              <div
                className="h-2 bg-gradient-to-r from-orange-500 to-green-500 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* New Task Button */}
          <button
            onClick={() => setShowNewTaskForm(!showNewTaskForm)}
            className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-lg font-semibold mb-4 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            {showNewTaskForm ? 'Cancel' : 'New Task'}
          </button>

          {/* New Task Form */}
          {showNewTaskForm && (
            <div className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
              <h3 className="font-bold text-sm text-orange-400 mb-3 flex items-center gap-2"><Plus size={16} /> Create Task</h3>
              <input type="text" placeholder="Task title..." value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full bg-gray-700 rounded-lg px-3 py-2 mb-3 text-sm" />
              <textarea placeholder="Description (optional)..." value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="w-full bg-gray-700 rounded-lg px-3 py-2 mb-3 h-16 resize-none text-sm" />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value})} className="bg-gray-700 rounded-lg px-3 py-2 text-sm">
                  {Object.entries(categoryColors).map(([k, v]) => <option key={k} value={k}>{v.icon} {k}</option>)}
                </select>
                <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} className="bg-gray-700 rounded-lg px-3 py-2 text-sm">
                  <option value="low">🟢 Low</option><option value="medium">🟡 Medium</option><option value="high">🟠 High</option><option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              
              {/* Date Picker */}
              <div className="mb-3">
                <label className="text-xs text-gray-400 mb-2 block">📅 Due Date: {selectedNewTaskDate.toLocaleDateString()}</label>
                <div className="bg-gray-700 rounded-lg p-2">
                  <div className="flex justify-between items-center mb-2">
                    <button onClick={() => { const d = new Date(newTaskDateYear, newTaskDateMonth - 1, 1); setNewTaskDateMonth(d.getMonth()); setNewTaskDateYear(d.getFullYear()); }} className="p-1 hover:bg-gray-600 rounded"><ChevronLeft size={14} /></button>
                    <span className="text-xs font-bold">{new Date(newTaskDateYear, newTaskDateMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => { const d = new Date(newTaskDateYear, newTaskDateMonth + 1, 1); setNewTaskDateMonth(d.getMonth()); setNewTaskDateYear(d.getFullYear()); }} className="p-1 hover:bg-gray-600 rounded"><ChevronRight size={14} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[9px] mb-1">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d,i) => <div key={i} className="text-gray-500 font-bold">{d}</div>)}</div>
                  <div className="grid grid-cols-7 gap-1">{renderCalendar(true, (date) => setSelectedNewTaskDate(date), newTaskDateMonth, newTaskDateYear)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <select value={newTask.assignee} onChange={(e) => setNewTask({...newTask, assignee: e.target.value})} className="bg-gray-700 rounded-lg px-3 py-2 text-sm">
                  <option value="">👤 Unassigned</option>
                  {sharedTeamMembers.map(m => <option key={m.odii} value={m.displayName}>{m.displayName}</option>)}
                </select>
                <input type="number" placeholder="Est. minutes" value={newTask.estimatedTime} onChange={(e) => setNewTask({...newTask, estimatedTime: e.target.value})} className="bg-gray-700 rounded-lg px-3 py-2 text-sm" />
              </div>
              <button onClick={handleAddTask} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm">✨ Create Task</button>
            </div>
          )}

          {/* Search & Filter */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-800 rounded-lg px-3 py-2 text-sm">
              <option value="dueDate">Due Date</option><option value="priority">Priority</option><option value="title">Title</option>
            </select>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-800 rounded-lg">{sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}</button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['All', 'Active', 'Today', 'My Tasks', 'Completed'].map(f => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedFilter === f ? 'bg-orange-500' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {f}
                {f === 'Today' && stats.dueToday > 0 && (
                  <span className="w-5 h-5 bg-orange-600 rounded-full text-xs flex items-center justify-center">
                    {stats.dueToday}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Target size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No tasks found</p>
              </div>
            ) : (
              filteredTasks.map(task => {
                const remaining = getRemainingTime(task);
                const dueDate = new Date(task.dueDate);
                const isOverdue = dueDate < currentDate && task.status !== 'completed';
                return (
                  <div
                    key={task.id}
                    className={`bg-gray-800 rounded-lg p-4 border-l-4 transition-all ${
                      task.status === 'completed' ? 'border-green-500 opacity-60' : isOverdue ? 'border-red-500 bg-red-900/10' : priorityColors[task.priority].border
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTaskComplete(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:border-orange-500'
                        }`}
                      >
                        {task.status === 'completed' && <Check size={14} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-bold ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>{task.title}</h4>
                          {task.status !== 'completed' && (
                            <div className={`text-right flex-shrink-0 flex items-center gap-1 ${remaining.isOvertime ? 'text-red-500' : 'text-yellow-500'}`}>
                              <span className="text-lg">⏳</span>
                              <span className={`font-bold ${remaining.isOvertime ? 'animate-pulse' : ''}`}>
                                {remaining.text}
                              </span>
                            </div>
                          )}
                        </div>
                        {task.description && <p className="text-xs text-gray-400 mt-1 line-clamp-1">📝 {task.description}</p>}
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          <span className={`${categoryColors[task.category]?.bg} text-xs px-2 py-0.5 rounded`}>{categoryColors[task.category]?.icon} {task.category}</span>
                          <span className={`${priorityColors[task.priority].bg} text-xs px-2 py-0.5 rounded`}>{task.priority}</span>
                          <span className="text-xs text-gray-500">📅 {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          {task.assignee && <span className="text-xs text-gray-500">👤 {task.assignee}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-400">
                          <MessageSquare size={16} />
                        </button>
                        <button onClick={() => handleDeleteTask(task.id)} className="p-2 bg-gray-700 hover:bg-red-600 rounded text-gray-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {/* Comments Section */}
                    {selectedTask === task.id && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <h5 className="text-xs font-bold mb-2">💬 Comments ({task.comments?.length || 0})</h5>
                        <div className="space-y-1 max-h-24 overflow-y-auto mb-2">
                          {task.comments?.map(c => (
                            <div key={c.id} className="bg-gray-700 rounded p-2 text-xs">
                              <div className="flex justify-between text-[10px] mb-0.5"><span className="text-orange-400 font-bold">{c.user}</span><span className="text-gray-500">{c.time}</span></div>
                              <p>{c.text}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" placeholder="Add comment..." value={comment} onChange={(e) => setComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment(task.id)} className="flex-1 bg-gray-700 rounded px-2 py-1.5 text-xs" />
                          <button onClick={() => handleAddComment(task.id)} className="p-1.5 bg-orange-500 rounded"><Send size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* Right Sidebar - 220px */}
        <aside className="w-[220px] bg-gray-800 p-3 border-l border-gray-700 overflow-y-auto flex-shrink-0">
          {/* Pending Tasks */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">Pending Tasks</span>
              <span className="w-5 h-5 bg-orange-500 rounded-full text-xs flex items-center justify-center">
                {pendingTasks.length}
              </span>
            </div>
            <div className="space-y-2 max-h-28 overflow-y-auto">
              {pendingTasks.slice(0, 4).map(task => (
                <div key={task.id} className="bg-gray-900 rounded p-2 border-l-4 border-orange-500">
                  <div className="font-medium text-xs truncate">{task.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[8px] ${priorityColors[task.priority].bg} px-1.5 py-0.5 rounded`}>{task.priority}</span>
                    <span className="text-[8px] text-gray-500">📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="text-center text-gray-500 text-xs py-3">No pending tasks! 🎉</div>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-gray-900 rounded-lg p-2">
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => { setCalendarMonth(m => m === 0 ? 11 : m - 1); if (calendarMonth === 0) setCalendarYear(y => y - 1); }} className="p-1 hover:bg-gray-700 rounded"><ChevronLeft size={12} /></button>
              <span className="font-semibold text-[10px]">{new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => { setCalendarMonth(m => m === 11 ? 0 : m + 1); if (calendarMonth === 11) setCalendarYear(y => y + 1); }} className="p-1 hover:bg-gray-700 rounded"><ChevronRight size={12} /></button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d,i) => <div key={i} className="text-gray-500 font-bold">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {renderCalendar()}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[8px] flex-wrap">
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Urgent</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>High</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>Medium</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Low</div>
            </div>
          </div>

          {/* Selected Date Tasks */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[10px]">{new Date(calendarYear, calendarMonth, selectedCalendarDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="bg-orange-500 px-1.5 py-0.5 rounded-full text-[9px] font-bold">{selectedDateTasks.length}</span>
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-3 text-gray-500 text-[10px]">
                  <Calendar size={16} className="mx-auto mb-1 opacity-30" />
                  No tasks for this day
                </div>
              ) : (
                selectedDateTasks.map(task => {
                  const remaining = getRemainingTime(task);
                  return (
                    <div key={task.id} className={`p-2 rounded-lg border-l-2 ${task.status === 'completed' ? 'bg-green-900/20 border-green-500' : `bg-gray-700 ${priorityColors[task.priority].border}`}`}>
                      <div className="font-bold text-[10px] flex justify-between">
                        <span className={task.status === 'completed' ? 'line-through opacity-50' : ''}>{task.title}</span>
                        {task.status === 'completed' && <Check size={10} className="text-green-500" />}
                      </div>
                      {task.status !== 'completed' && (
                        <p className={`text-[9px] font-bold mt-0.5 ${remaining.isOvertime ? 'text-red-500' : 'text-yellow-400'}`}>
                          ⏳ {remaining.text}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TaskFlowDashboard;
