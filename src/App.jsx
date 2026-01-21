import React, { useState, useEffect, useMemo } from 'react';
import { Clock, TrendingUp, Settings, Plus, Trash2, Check, Calendar, Bell, Repeat, MessageSquare, Paperclip, Users, X, Send, LogOut, Download, BarChart3, PieChart, Activity, ChevronDown, Eye, UserCircle } from 'lucide-react';

const TaskFlowApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(new Date(2026, 0, 21));
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [teamNote, setTeamNote] = useState('');
  const [teamNotes, setTeamNotes] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(8 * 60 * 60);
  const [todayWorkLog, setTodayWorkLog] = useState([]);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  const [customGoalHours, setCustomGoalHours] = useState(8);
  const [showActivityTimeline, setShowActivityTimeline] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showTeamView, setShowTeamView] = useState(false);
  const [allUsersData, setAllUsersData] = useState([]);
  const [currentTimerTask, setCurrentTimerTask] = useState(null);
  const [workHistory, setWorkHistory] = useState([]);
  
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'work',
    priority: 'medium',
    dueDate: '2026-01-21',
    assignee: '',
    estimatedTime: '',
    recurring: 'none',
    description: ''
  });

  const [tasks, setTasks] = useState([]);
  const [comment, setComment] = useState('');

  // Version info
  const appVersion = "1.0.0";

  // Initialize app
  useEffect(() => {
    const savedUser = localStorage.getItem('taskflow_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadUserData(parsedUser.uid);
    }
    loadAllUsersData();
    setLoading(false);
  }, []);

  // Load all users data for team view
  const loadAllUsersData = () => {
    const users = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('taskflow_user_profile_')) {
        const userData = JSON.parse(localStorage.getItem(key));
        users.push(userData);
      }
    }
    setAllUsersData(users);
  };

  // Load user-specific data
  const loadUserData = (userId) => {
    const savedTasks = localStorage.getItem(`taskflow_tasks_${userId}`);
    const savedNotes = localStorage.getItem(`taskflow_notes_${userId}`);
    const savedWorkLog = localStorage.getItem(`taskflow_worklog_${userId}`);
    const savedGoal = localStorage.getItem(`taskflow_goal_${userId}`);
    const savedWorkHistory = localStorage.getItem(`taskflow_work_history_${userId}`);

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks([
        { 
          id: 1, 
          title: 'Complete project proposal', 
          category: 'work', 
          priority: 'urgent', 
          dueDate: 20, 
          status: 'pending', 
          assignee: '',
          recurring: 'none',
          comments: [],
          attachments: [],
          completedAt: null,
          timeSpent: 0
        },
        { 
          id: 2, 
          title: 'Review design mockups', 
          category: 'design', 
          priority: 'high', 
          dueDate: 21, 
          status: 'pending', 
          assignee: '',
          recurring: 'none',
          comments: [],
          attachments: [],
          completedAt: null,
          timeSpent: 0
        },
      ]);
    }

    if (savedNotes) {
      setTeamNotes(JSON.parse(savedNotes));
    } else {
      setTeamNotes([
        { id: 1, text: 'Welcome to TaskFlow 1.0! Start managing your tasks.', user: 'System', time: 'just now' }
      ]);
    }

    if (savedWorkLog) {
      setTodayWorkLog(JSON.parse(savedWorkLog));
    }

    if (savedGoal) {
      const goalHours = parseInt(savedGoal);
      setCustomGoalHours(goalHours);
      setDailyTarget(goalHours * 60 * 60);
    }

    if (savedWorkHistory) {
      setWorkHistory(JSON.parse(savedWorkHistory));
    }
  };

  // Save user data whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`taskflow_tasks_${user.uid}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`taskflow_notes_${user.uid}`, JSON.stringify(teamNotes));
    }
  }, [teamNotes, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`taskflow_worklog_${user.uid}`, JSON.stringify(todayWorkLog));
    }
  }, [todayWorkLog, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`taskflow_work_history_${user.uid}`, JSON.stringify(workHistory));
    }
  }, [workHistory, user]);

  // Save user profile for team view
  useEffect(() => {
    if (user) {
      const userProfile = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        totalHoursWorked: getTotalWorkedAllTime(),
        tasksCompleted: tasks.filter(t => t.status === 'completed').length,
        tasksPending: tasks.filter(t => t.status === 'pending').length,
        lastActive: new Date().toISOString()
      };
      localStorage.setItem(`taskflow_user_profile_${user.uid}`, JSON.stringify(userProfile));
    }
  }, [user, tasks, workHistory]);

  // Sign in
  const signInWithGoogle = () => {
    const userName = prompt('Enter your name:') || 'Demo User';
    const demoUser = {
      uid: 'user_' + Date.now(),
      displayName: userName,
      email: `${userName.toLowerCase().replace(/\s+/g, '.')}@taskflow.com`,
      photoURL: null
    };
    
    setUser(demoUser);
    localStorage.setItem('taskflow_user', JSON.stringify(demoUser));
    loadUserData(demoUser.uid);
    loadAllUsersData();
  };

  // Sign Out
  const signOut = () => {
    setUser(null);
    localStorage.removeItem('taskflow_user');
    setTasks([]);
    setTeamNotes([]);
    setTodayWorkLog([]);
    setWorkHistory([]);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Generate notifications
  useEffect(() => {
    const newNotifications = [];
    tasks.forEach(task => {
      if (task.status !== 'completed') {
        if (task.dueDate < 21) {
          newNotifications.push({
            id: `overdue-${task.id}`,
            type: 'overdue',
            message: `Task "${task.title}" is overdue!`,
            taskId: task.id,
            time: 'now'
          });
        } else if (task.dueDate === 21) {
          newNotifications.push({
            id: `today-${task.id}`,
            type: 'today',
            message: `Task "${task.title}" is due today!`,
            taskId: task.id,
            time: 'today'
          });
        } else if (task.dueDate === 22) {
          newNotifications.push({
            id: `tomorrow-${task.id}`,
            type: 'upcoming',
            message: `Task "${task.title}" is due tomorrow`,
            taskId: task.id,
            time: 'tomorrow'
          });
        }
      }
    });
    setNotifications(newNotifications);
  }, [tasks]);

  const priorityColors = {
    urgent: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
    high: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' },
    low: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' }
  };

  const categoryColors = {
    work: 'bg-blue-600',
    design: 'bg-purple-600',
    meeting: 'bg-pink-600',
    development: 'bg-cyan-600'
  };

  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    dueToday: tasks.filter(t => t.dueDate === 21 && t.status !== 'completed').length
  }), [tasks]);

  // FIXED: Task completion handler
  const handleToggleTaskComplete = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null
        };
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
      dueDate: parseInt(newTask.dueDate.split('-')[2]),
      status: 'pending',
      assignee: newTask.assignee || user?.displayName,
      estimatedTime: newTask.estimatedTime,
      recurring: newTask.recurring,
      description: newTask.description,
      comments: [],
      attachments: [],
      completedAt: null,
      timeSpent: 0,
      createdAt: new Date().toISOString(),
      createdBy: user?.displayName
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      category: 'work',
      priority: 'medium',
      dueDate: '2026-01-21',
      assignee: '',
      estimatedTime: '',
      recurring: 'none',
      description: ''
    });
    setShowNewTaskForm(false);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleAddComment = (taskId) => {
    if (!comment.trim()) return;
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          comments: [
            ...task.comments,
            {
              id: Date.now(),
              user: user.displayName,
              text: comment,
              time: new Date().toLocaleString()
            }
          ]
        };
      }
      return task;
    }));
    setComment('');
  };

  const handleFileAttach = (taskId) => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          attachments: [
            ...task.attachments,
            {
              id: Date.now(),
              name: fileName,
              size: '2.3 MB',
              type: 'document'
            }
          ]
        };
      }
      return task;
    }));
  };

  const handleAddTeamNote = () => {
    if (!teamNote.trim()) return;
    
    setTeamNotes([
      {
        id: Date.now(),
        text: teamNote,
        user: user.displayName,
        time: new Date().toLocaleString()
      },
      ...teamNotes
    ]);
    setTeamNote('');
  };

  const handleDeleteNote = (noteId) => {
    setTeamNotes(teamNotes.filter(note => note.id !== noteId));
  };

  const toggleTimer = (taskId = null) => {
    if (isTimerRunning) {
      const workEntry = {
        id: Date.now(),
        duration: timerSeconds,
        startTime: new Date(Date.now() - timerSeconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        taskId: currentTimerTask,
        taskTitle: currentTimerTask ? tasks.find(t => t.id === currentTimerTask)?.title : 'General Work',
        user: user?.displayName
      };
      
      setTodayWorkLog([...todayWorkLog, workEntry]);
      setWorkHistory([...workHistory, workEntry]);
      
      // Update task time spent
      if (currentTimerTask) {
        setTasks(tasks.map(task => {
          if (task.id === currentTimerTask) {
            return { ...task, timeSpent: (task.timeSpent || 0) + timerSeconds };
          }
          return task;
        }));
      }
      
      setTimerSeconds(0);
      setCurrentTimerTask(null);
    } else {
      setCurrentTimerTask(taskId);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const updateDailyGoal = () => {
    setDailyTarget(customGoalHours * 60 * 60);
    if (user) {
      localStorage.setItem(`taskflow_goal_${user.uid}`, customGoalHours.toString());
    }
    setShowGoalSettings(false);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatHours = (seconds) => {
    return (seconds / 3600).toFixed(1);
  };

  const getTotalWorkedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = workHistory.filter(log => log.date === today);
    return todayLogs.reduce((total, log) => total + log.duration, 0) + (isTimerRunning ? timerSeconds : 0);
  };

  const getTotalWorkedThisWeek = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    return workHistory.filter(log => new Date(log.date) >= weekStart)
      .reduce((total, log) => total + log.duration, 0);
  };

  const getTotalWorkedThisMonth = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return workHistory.filter(log => new Date(log.date) >= monthStart)
      .reduce((total, log) => total + log.duration, 0);
  };

  const getTotalWorkedAllTime = () => {
    return workHistory.reduce((total, log) => total + log.duration, 0);
  };

  const getProgressPercentage = () => {
    return Math.min((getTotalWorkedToday() / dailyTarget) * 100, 100);
  };

  // Get work data by day for charts
  const getWorkDataByDay = (days = 7) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = workHistory.filter(log => log.date === dateStr);
      const totalSeconds = dayLogs.reduce((sum, log) => sum + log.duration, 0);
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        hours: parseFloat((totalSeconds / 3600).toFixed(1)),
        tasks: dayLogs.length
      });
    }
    return data;
  };

  // Download data functions
  const downloadData = (period) => {
    let data = {};
    const now = new Date();
    
    if (period === 'daily') {
      const today = now.toISOString().split('T')[0];
      data = {
        period: 'Daily Report',
        date: today,
        user: user?.displayName,
        totalHoursWorked: formatHours(getTotalWorkedToday()),
        tasks: tasks.filter(t => t.status === 'completed' && t.completedAt?.startsWith(today)),
        workSessions: workHistory.filter(log => log.date === today)
      };
    } else if (period === 'weekly') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      data = {
        period: 'Weekly Report',
        weekStarting: weekStart.toISOString().split('T')[0],
        user: user?.displayName,
        totalHoursWorked: formatHours(getTotalWorkedThisWeek()),
        tasksCompleted: tasks.filter(t => t.status === 'completed').length,
        dailyBreakdown: getWorkDataByDay(7),
        workSessions: workHistory.filter(log => new Date(log.date) >= weekStart)
      };
    } else if (period === 'monthly') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      data = {
        period: 'Monthly Report',
        month: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        user: user?.displayName,
        totalHoursWorked: formatHours(getTotalWorkedThisMonth()),
        tasksCompleted: tasks.filter(t => t.status === 'completed').length,
        tasksPending: tasks.filter(t => t.status === 'pending').length,
        dailyBreakdown: getWorkDataByDay(30),
        workSessions: workHistory.filter(log => new Date(log.date) >= monthStart),
        allTasks: tasks
      };
    } else {
      data = {
        period: 'All Time Report',
        user: user?.displayName,
        totalHoursWorked: formatHours(getTotalWorkedAllTime()),
        allTasks: tasks,
        allWorkSessions: workHistory,
        teamNotes: teamNotes
      };
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-${period}-report-${now.toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadModal(false);
  };

  const downloadCSV = (period) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let rows = [];
    
    if (period === 'tasks') {
      rows.push(['ID', 'Title', 'Category', 'Priority', 'Status', 'Assignee', 'Due Date', 'Time Spent (hours)', 'Created At', 'Completed At']);
      tasks.forEach(task => {
        rows.push([
          task.id,
          task.title,
          task.category,
          task.priority,
          task.status,
          task.assignee || 'Unassigned',
          `Jan ${task.dueDate}, 2026`,
          formatHours(task.timeSpent || 0),
          task.createdAt || '',
          task.completedAt || ''
        ]);
      });
    } else {
      rows.push(['Date', 'Task', 'Duration (hours)', 'Start Time', 'End Time', 'User']);
      workHistory.forEach(log => {
        rows.push([
          log.date,
          log.taskTitle || 'General Work',
          formatHours(log.duration),
          new Date(log.startTime).toLocaleTimeString(),
          new Date(log.endTime).toLocaleTimeString(),
          log.user
        ]);
      });
    }

    csvContent += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = `taskflow-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShowDownloadModal(false);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

  const getTasksForDate = (date) => {
    return tasks.filter(task => task.dueDate === date);
  };

  const renderCalendar = () => {
    const days = [];
    const blanks = [];

    for (let i = 0; i < firstDay; i++) {
      blanks.push(<div key={`blank-${i}`} className="h-12"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayTasks = getTasksForDate(d);
      const isToday = d === 21;

      days.push(
        <div
          key={d}
          className={`h-12 border rounded-md p-1 cursor-pointer transition-all hover:border-orange-500 ${
            isToday ? 'bg-orange-500 text-white border-orange-500' : 'bg-[#1a1a1a] border-gray-800'
          }`}
        >
          <div className="text-xs font-medium mb-0.5">{d}</div>
          {dayTasks.length > 0 && (
            <div className="flex gap-0.5 flex-wrap">
              {dayTasks.slice(0, 3).map((task, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${priorityColors[task.priority].bg} ${
                    task.priority === 'urgent' ? 'animate-pulse' : ''
                  }`}
                ></div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return [...blanks, ...days];
  };

  // Simple bar chart component
  const BarChart = ({ data, height = 150 }) => {
    const maxValue = Math.max(...data.map(d => d.hours), 1);
    
    return (
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-sm transition-all duration-300 hover:from-orange-500 hover:to-orange-300"
              style={{ height: `${(item.hours / maxValue) * 100}%`, minHeight: item.hours > 0 ? '4px' : '0' }}
            ></div>
            <div className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{item.date.split(' ')[0]}</div>
            <div className="text-xs text-orange-500 font-semibold">{item.hours}h</div>
          </div>
        ))}
      </div>
    );
  };

  const NavButton = ({ icon: Icon, label, badge, onClick, active }) => (
    <div className="relative group">
      <button 
        onClick={onClick}
        className={`p-2.5 rounded-lg transition-colors border ${
          active ? 'bg-orange-500 border-orange-500' : 'bg-[#1a1a1a] hover:bg-gray-800 border-gray-800'
        } relative`}
      >
        <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {badge}
          </span>
        )}
      </button>
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
        {label}
      </div>
    </div>
  );

  const filteredTasks = selectedFilter === 'All' 
    ? tasks 
    : selectedFilter === 'Today'
    ? tasks.filter(t => t.dueDate === 21)
    : selectedFilter === 'My Tasks'
    ? tasks.filter(t => t.assignee === user?.displayName)
    : tasks.filter(t => t.status === selectedFilter.toLowerCase());

  const pendingTasks = tasks.filter(t => t.status === 'pending');

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <svg className="w-12 h-12" fill="white" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-2">TaskFlow</h1>
            <p className="text-gray-400">Team Productivity Suite v{appVersion}</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-6 text-center">Welcome</h2>
            
            <button
              onClick={signInWithGoogle}
              className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3 mb-4"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <p className="text-center text-sm text-gray-500">
              By signing in, you agree to our Terms of Service
            </p>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mb-3">✨ Features in v1.0:</p>
            <div className="grid grid-cols-2 gap-3">
              <span className="bg-[#1a1a1a] px-3 py-2 rounded-lg">📋 Task Management</span>
              <span className="bg-[#1a1a1a] px-3 py-2 rounded-lg">⏱️ Time Tracking</span>
              <span className="bg-[#1a1a1a] px-3 py-2 rounded-lg">📊 Reports & Analytics</span>
              <span className="bg-[#1a1a1a] px-3 py-2 rounded-lg">👥 Team Overview</span>
              <span className="bg-[#1a1a1a] px-3 py-2 rounded-lg">📥 Data Export</span>
              <span className="bg-[#1a1a1a] px-3 py-2 rounded-lg">📅 Calendar View</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                TaskFlow 
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">v{appVersion}</span>
              </h1>
              <p className="text-xs text-gray-500">Welcome, {user.displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">{allUsersData.length || 1} online</span>
            </div>
            <NavButton 
              icon={Users} 
              label="Team View" 
              onClick={() => setShowTeamView(!showTeamView)}
              active={showTeamView}
            />
            <NavButton icon={Bell} label="Notifications" badge={notifications.length} onClick={() => setShowNotifications(!showNotifications)} />
            <NavButton icon={Clock} label="Activity Timeline" onClick={() => setShowActivityTimeline(!showActivityTimeline)} />
            <NavButton icon={BarChart3} label="Analytics & Reports" onClick={() => setShowAnalytics(!showAnalytics)} />
            <NavButton icon={Download} label="Download Data" onClick={() => setShowDownloadModal(!showDownloadModal)} />
            <NavButton icon={Settings} label="Settings" onClick={() => setShowSettings(!showSettings)} />
            <button
              onClick={signOut}
              className="p-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors border border-red-500/30"
              title="Sign Out"
            >
              <LogOut size={18} className="text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-20 right-6 w-96 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <button onClick={() => setShowNotifications(false)}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 ${
                    notif.type === 'overdue' ? 'bg-red-950/20' :
                    notif.type === 'today' ? 'bg-orange-950/20' :
                    'bg-blue-950/20'
                  }`}
                >
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Team View Modal */}
      {showTeamView && (
        <div className="absolute top-20 right-6 w-[500px] bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50 max-h-[600px] overflow-y-auto">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#1a1a1a]">
            <h3 className="font-semibold flex items-center gap-2">
              <Users size={18} className="text-orange-500" />
              Team Overview
            </h3>
            <button onClick={() => setShowTeamView(false)}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {/* Current user */}
            <div className="bg-orange-950/20 border border-orange-800/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <UserCircle size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{user.displayName} <span className="text-xs text-orange-400">(You)</span></div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-black/30 rounded-lg p-2">
                  <div className="text-lg font-bold text-orange-500">{formatHours(getTotalWorkedAllTime())}h</div>
                  <div className="text-[10px] text-gray-500">Total Hours</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2">
                  <div className="text-lg font-bold text-green-500">{stats.done}</div>
                  <div className="text-[10px] text-gray-500">Completed</div>
                </div>
                <div className="bg-black/30 rounded-lg p-2">
                  <div className="text-lg font-bold text-yellow-500">{stats.pending}</div>
                  <div className="text-[10px] text-gray-500">Pending</div>
                </div>
              </div>
            </div>

            {/* Other team members */}
            {allUsersData.filter(u => u.uid !== user.uid).map(member => (
              <div key={member.uid} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                    <UserCircle size={24} className="text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{member.displayName}</div>
                    <div className="text-xs text-gray-400">{member.email}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last active: {new Date(member.lastActive).toLocaleDateString()}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-black/30 rounded-lg p-2">
                    <div className="text-lg font-bold text-orange-500">{formatHours(member.totalHoursWorked || 0)}h</div>
                    <div className="text-[10px] text-gray-500">Total Hours</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <div className="text-lg font-bold text-green-500">{member.tasksCompleted || 0}</div>
                    <div className="text-[10px] text-gray-500">Completed</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2">
                    <div className="text-lg font-bold text-yellow-500">{member.tasksPending || 0}</div>
                    <div className="text-[10px] text-gray-500">Pending</div>
                  </div>
                </div>
              </div>
            ))}

            {allUsersData.length <= 1 && (
              <div className="text-center text-gray-500 py-4">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No other team members yet</p>
                <p className="text-xs">Invite your team to collaborate!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="absolute top-20 right-6 w-80 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <Download size={18} className="text-orange-500" />
              Download Reports
            </h3>
            <button onClick={() => setShowDownloadModal(false)}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-400 mb-4">Export your data as JSON or CSV files</p>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-orange-500">JSON Reports</h4>
              <button onClick={() => downloadData('daily')} className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-left transition-colors">
                <div className="font-medium">Daily Report</div>
                <div className="text-xs text-gray-400">Today's work sessions & completed tasks</div>
              </button>
              <button onClick={() => downloadData('weekly')} className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-left transition-colors">
                <div className="font-medium">Weekly Report</div>
                <div className="text-xs text-gray-400">This week's breakdown & analytics</div>
              </button>
              <button onClick={() => downloadData('monthly')} className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-left transition-colors">
                <div className="font-medium">Monthly Report</div>
                <div className="text-xs text-gray-400">Full month overview & all tasks</div>
              </button>
              <button onClick={() => downloadData('all')} className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-left transition-colors">
                <div className="font-medium">All Time Data</div>
                <div className="text-xs text-gray-400">Complete data export</div>
              </button>
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-800">
              <h4 className="text-sm font-semibold text-orange-500">CSV Exports</h4>
              <button onClick={() => downloadCSV('tasks')} className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-left transition-colors">
                <div className="font-medium">Tasks CSV</div>
                <div className="text-xs text-gray-400">All tasks in spreadsheet format</div>
              </button>
              <button onClick={() => downloadCSV('worklogs')} className="w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-left transition-colors">
                <div className="font-medium">Work Logs CSV</div>
                <div className="text-xs text-gray-400">All time entries in spreadsheet format</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      {showActivityTimeline && (
        <div className="absolute top-20 right-6 w-96 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50 max-h-[600px] overflow-y-auto">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#1a1a1a]">
            <h3 className="font-semibold">Activity Timeline</h3>
            <button onClick={() => setShowActivityTimeline(false)}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="p-4">
            {workHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No activity recorded</div>
            ) : (
              <div className="space-y-4">
                {workHistory.slice().reverse().slice(0, 20).map((log, index) => (
                  <div key={log.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      {index < Math.min(workHistory.length - 1, 19) && (
                        <div className="w-0.5 h-full bg-gray-700 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-semibold text-orange-500">{log.taskTitle || 'Work Session'}</span>
                          <span className="text-xs text-gray-500">{formatTime(log.duration)}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          <div>{new Date(log.startTime).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics & Reports */}
      {showAnalytics && (
        <div className="absolute top-20 right-6 w-[550px] bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50 max-h-[700px] overflow-y-auto">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#1a1a1a]">
            <h3 className="font-semibold flex items-center gap-2">
              <BarChart3 size={18} className="text-orange-500" />
              Analytics & Reports
            </h3>
            <button onClick={() => setShowAnalytics(false)}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {/* Time Summary */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3 text-orange-500 flex items-center gap-2">
                <Clock size={16} />
                Time Summary
              </h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-500">{formatHours(getTotalWorkedToday())}h</div>
                  <div className="text-xs text-gray-400">Today</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-500">{formatHours(getTotalWorkedThisWeek())}h</div>
                  <div className="text-xs text-gray-400">This Week</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-500">{formatHours(getTotalWorkedThisMonth())}h</div>
                  <div className="text-xs text-gray-400">This Month</div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-500">{formatHours(getTotalWorkedAllTime())}h</div>
                  <div className="text-xs text-gray-400">All Time</div>
                </div>
              </div>
            </div>

            {/* Weekly Chart */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-4 text-orange-500 flex items-center gap-2">
                <Activity size={16} />
                Weekly Work Hours
              </h4>
              <BarChart data={getWorkDataByDay(7)} height={120} />
            </div>

            {/* Task Statistics */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3 text-orange-500 flex items-center gap-2">
                <PieChart size={16} />
                Task Statistics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Tasks</span>
                    <span className="text-xl font-bold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-400">Completed</span>
                    <span className="text-xl font-bold text-green-500">{stats.done}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-yellow-400">Pending</span>
                    <span className="text-xl font-bold text-yellow-500">{stats.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-400">Due Today</span>
                    <span className="text-xl font-bold text-orange-500">{stats.dueToday}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="48" stroke="#374151" strokeWidth="8" fill="none" />
                      <circle 
                        cx="56" cy="56" r="48" 
                        stroke="#22c55e" 
                        strokeWidth="8" 
                        fill="none"
                        strokeDasharray={`${(stats.done / Math.max(stats.total, 1)) * 301.6} 301.6`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3 text-orange-500">Priority Breakdown</h4>
              <div className="space-y-2">
                {['urgent', 'high', 'medium', 'low'].map(priority => {
                  const count = tasks.filter(t => t.priority === priority).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={priority} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${priorityColors[priority].bg}`}></div>
                          <span className="capitalize">{priority}</span>
                        </div>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${priorityColors[priority].bg}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Work Sessions Summary */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3 text-orange-500">Work Sessions</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{workHistory.length}</div>
                  <div className="text-xs text-gray-400">Total Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {workHistory.length > 0 ? formatTime(Math.round(workHistory.reduce((sum, l) => sum + l.duration, 0) / workHistory.length)) : '00:00:00'}
                  </div>
                  <div className="text-xs text-gray-400">Avg. Session</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      {showSettings && (
        <div className="absolute top-20 right-6 w-[400px] bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl z-50">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold">Settings & Preferences</h3>
            <button onClick={() => setShowSettings(false)}>
              <X size={18} className="text-gray-400" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3 text-orange-500">Account</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">User</span>
                  <span>{user.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-xs">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Version</span>
                  <span>v{appVersion}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3 text-orange-500">Daily Goal</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={customGoalHours}
                  onChange={(e) => setCustomGoalHours(parseInt(e.target.value) || 1)}
                  className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={updateDailyGoal}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded text-sm font-semibold transition-colors"
                >
                  Set Goal
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Current goal: {customGoalHours} hours/day</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-3 text-orange-500">Data Management</h4>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 p-3 rounded-lg text-sm transition-colors"
              >
                Clear All Local Data
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <div className="w-1/4 border-r border-gray-900 p-4 overflow-y-auto">
          {/* Time Tracker */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-green-500">
                <Clock size={20} />
                <h3 className="font-semibold">Time Tracker</h3>
              </div>
              <button
                onClick={() => setShowGoalSettings(!showGoalSettings)}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                title="Customize Goal"
              >
                <Settings size={16} className="text-orange-500" />
              </button>
            </div>

            {showGoalSettings && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                <h4 className="text-xs font-semibold mb-2 text-orange-500">Daily Goal (Hours)</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={customGoalHours}
                    onChange={(e) => setCustomGoalHours(parseInt(e.target.value) || 1)}
                    className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={updateDailyGoal}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded text-sm font-semibold transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>
            )}

            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-orange-500 mb-2">
                {formatTime(isTimerRunning ? timerSeconds : 0)}
              </div>
              <p className="text-xs text-gray-500">
                {isTimerRunning ? (currentTimerTask ? tasks.find(t => t.id === currentTimerTask)?.title : 'General Work') : 'Ready to Start'}
              </p>
            </div>

            {/* Task selector for timer */}
            {!isTimerRunning && (
              <select
                value={currentTimerTask || ''}
                onChange={(e) => setCurrentTimerTask(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-orange-500"
              >
                <option value="">General Work</option>
                {tasks.filter(t => t.status === 'pending').map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            )}

            <button
              onClick={() => toggleTimer(currentTimerTask)}
              className={`w-full py-3 rounded-lg font-semibold transition-colors mb-3 ${
                isTimerRunning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
            </button>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Daily Goal</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatTime(getTotalWorkedToday())} / {formatTime(dailyTarget)}
              </p>
            </div>

            {todayWorkLog.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Today's Sessions</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {todayWorkLog.map(log => (
                    <div key={log.id} className="bg-gray-800 rounded p-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400 truncate flex-1">{log.taskTitle || 'General'}</span>
                        <span className="text-green-500 font-semibold ml-2">{formatTime(log.duration)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Team Notes */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4 border border-gray-800">
            <div className="flex items-center gap-2 text-orange-500 mb-3">
              <MessageSquare size={18} />
              <h3 className="font-semibold">Team Notes</h3>
            </div>
            
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {teamNotes.map(note => (
                <div key={note.id} className="bg-gray-800 rounded p-2 text-xs group relative">
                  <p className="text-gray-300 mb-1 pr-12">{note.text}</p>
                  <div className="flex justify-between text-gray-500">
                    <span>{note.user}</span>
                    <span>{note.time}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="absolute top-2 right-2 p-1 bg-red-600 rounded hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a note..."
                value={teamNote}
                onChange={(e) => setTeamNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTeamNote()}
                className="flex-1 bg-black border border-gray-700 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={handleAddTeamNote}
                className="px-2 py-1.5 bg-orange-500 hover:bg-orange-600 rounded transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Task List */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <div className="text-3xl font-bold">{stats.total}</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 text-green-500 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-400">Done</span>
              </div>
              <div className="text-3xl font-bold">{stats.done}</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-gray-400">Pending</span>
              </div>
              <div className="text-3xl font-bold">{stats.pending}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/30 rounded-xl p-4 border border-orange-800/30">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <Calendar size={14} />
                <span className="text-xs text-gray-400">Due Today</span>
              </div>
              <div className="text-3xl font-bold">{stats.dueToday}</div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Team Progress</span>
              <span className="text-sm text-orange-500 font-semibold">
                {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-6">
            <button 
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <Plus size={20} />
              {showNewTaskForm ? 'Cancel' : 'New Task'}
            </button>
          </div>

          {showNewTaskForm && (
            <div className="bg-[#1a1a1a] rounded-xl p-6 mb-6 border border-gray-800">
              <div className="flex items-center gap-2 text-orange-500 mb-4">
                <Plus size={20} />
                <h3 className="font-semibold">Create New Task</h3>
              </div>
              
              <input 
                type="text" 
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:border-orange-500"
              />
              
              <textarea 
                placeholder="Task description..."
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:border-orange-500 h-20 resize-none"
              />
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select 
                  value={newTask.category}
                  onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                  className="bg-black border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="work">💼 Work</option>
                  <option value="design">🎨 Design</option>
                  <option value="meeting">👥 Meeting</option>
                  <option value="development">💻 Development</option>
                </select>
                
                <select 
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="bg-black border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🟠 High Priority</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <input 
                  type="date" 
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="bg-black border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                />
                <input 
                  type="text" 
                  placeholder="Assignee"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  className="bg-black border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                />
                <input 
                  type="text" 
                  placeholder="Est. time (mins)"
                  value={newTask.estimatedTime}
                  onChange={(e) => setNewTask({...newTask, estimatedTime: e.target.value})}
                  className="bg-black border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Repeat size={16} />
                  Recurring Task
                </label>
                <select 
                  value={newTask.recurring}
                  onChange={(e) => setNewTask({...newTask, recurring: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="none">No Repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <button 
                onClick={handleAddTask}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Task
              </button>
            </div>
          )}

          <div className="flex gap-2 mb-4 flex-wrap">
            {['All', 'Active', 'Today', 'My Tasks', 'Completed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-orange-500 text-white'
                    : 'bg-[#1a1a1a] text-gray-400 hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {filter}
                {filter === 'Today' && stats.dueToday > 0 && (
                  <span className="ml-2 bg-orange-600 px-2 py-0.5 rounded-full text-xs">{stats.dueToday}</span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Check size={48} className="mx-auto mb-4 opacity-30" />
                <p>No tasks found</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-[#1a1a1a] rounded-xl p-4 border transition-all ${
                    task.status === 'completed' 
                      ? 'border-green-800/30 bg-green-950/10' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* FIXED: Working completion button */}
                      <button 
                        onClick={() => handleToggleTaskComplete(task.id)}
                        className={`w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-600 hover:border-orange-500'
                        }`}
                      >
                        {task.status === 'completed' && (
                          <Check size={14} className="text-white" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-medium mb-2 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`${categoryColors[task.category]} text-xs px-2 py-1 rounded`}>
                            {task.category}
                          </span>
                          <span className={`${priorityColors[task.priority].bg} text-xs px-2 py-1 rounded ${
                            task.priority === 'urgent' && task.status !== 'completed' ? 'animate-pulse shadow-lg shadow-red-500/30' : ''
                          }`}>
                            {task.priority}
                          </span>
                          {task.recurring !== 'none' && (
                            <span className="bg-purple-600 text-xs px-2 py-1 rounded flex items-center gap-1">
                              <Repeat size={12} />
                              {task.recurring}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">Jan {task.dueDate}</span>
                          {task.assignee && (
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Users size={12} />
                              {task.assignee}
                            </span>
                          )}
                          {task.timeSpent > 0 && (
                            <span className="text-xs text-green-500 flex items-center gap-1">
                              <Clock size={12} />
                              {formatTime(task.timeSpent)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                        className="p-2 hover:bg-gray-800 rounded-lg"
                      >
                        <MessageSquare size={16} className="text-gray-500" />
                        {task.comments.length > 0 && (
                          <span className="ml-1 text-xs text-orange-500">{task.comments.length}</span>
                        )}
                      </button>
                      <button 
                        onClick={() => handleFileAttach(task.id)}
                        className="p-2 hover:bg-gray-800 rounded-lg"
                      >
                        <Paperclip size={16} className="text-gray-500" />
                        {task.attachments.length > 0 && (
                          <span className="ml-1 text-xs text-blue-500">{task.attachments.length}</span>
                        )}
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 hover:bg-gray-800 rounded-lg"
                      >
                        <Trash2 size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {selectedTask === task.id && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      {task.attachments.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Paperclip size={14} />
                            Attachments
                          </h5>
                          <div className="space-y-2">
                            {task.attachments.map(attachment => (
                              <div key={attachment.id} className="bg-gray-800 rounded p-2 text-xs flex items-center justify-between">
                                <span>{attachment.name}</span>
                                <span className="text-gray-500">{attachment.size}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <MessageSquare size={14} />
                          Comments
                        </h5>
                        <div className="space-y-2 mb-3">
                          {task.comments.length === 0 ? (
                            <p className="text-xs text-gray-500">No comments yet</p>
                          ) : (
                            task.comments.map(cmnt => (
                              <div key={cmnt.id} className="bg-gray-800 rounded p-3">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-xs font-semibold text-orange-500">{cmnt.user}</span>
                                  <span className="text-xs text-gray-500">{cmnt.time}</span>
                                </div>
                                <p className="text-sm">{cmnt.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(task.id)}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                          />
                          <button
                            onClick={() => handleAddComment(task.id)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar - Calendar */}
        <div className="w-1/4 border-l border-gray-900 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Pending Tasks</h3>
              <span className="bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                {pendingTasks.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border-l-4 transition-all hover:scale-[1.02] cursor-pointer ${
                    task.priority === 'urgent'
                      ? 'bg-red-950/20 border-red-500 animate-pulse shadow-lg shadow-red-500/10'
                      : task.priority === 'high'
                      ? 'bg-orange-950/20 border-orange-500'
                      : task.priority === 'medium'
                      ? 'bg-yellow-950/20 border-yellow-500'
                      : 'bg-green-950/20 border-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm flex-1">{task.title}</h4>
                    {task.recurring !== 'none' && (
                      <Repeat size={12} className="text-purple-400 ml-2" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority].bg}`}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>Jan {task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">January 2026</h3>
              <Calendar size={18} className="text-orange-500" />
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx} className="text-center text-xs font-medium text-gray-500 mb-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex gap-3 flex-wrap text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-gray-400">Urgent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-gray-400">High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-400">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFlowApp;
