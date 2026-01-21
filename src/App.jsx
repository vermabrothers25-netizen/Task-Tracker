import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Settings, Plus, Trash2, Check, Calendar, Bell, Repeat, MessageSquare, Paperclip, Users, X, Send } from 'lucide-react';

const TaskFlowApp = () => {
  const [currentDate] = useState(new Date(2026, 0, 20));
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [teamNote, setTeamNote] = useState('');
  const [teamNotes, setTeamNotes] = useState([
    { id: 1, text: 'Sprint planning meeting tomorrow at 10 AM', user: 'abhishek varma', time: '2 hours ago' },
    { id: 2, text: 'Client demo scheduled for Friday', user: 'john doe', time: '1 day ago' }
  ]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [dailyTarget] = useState(8 * 60 * 60); // 8 hours in seconds
  const [todayWorkLog, setTodayWorkLog] = useState([]);
  
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'work',
    priority: 'medium',
    dueDate: '2026-01-21',
    assignee: 'abhishek varma',
    estimatedTime: '',
    recurring: 'none',
    description: ''
  });

  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Complete project proposal', 
      category: 'work', 
      priority: 'urgent', 
      dueDate: 20, 
      status: 'pending', 
      assignee: 'abhishek varma',
      recurring: 'none',
      comments: [
        { id: 1, user: 'john doe', text: 'Need this by EOD', time: '2 hours ago' }
      ],
      attachments: []
    },
    { 
      id: 2, 
      title: 'Review design mockups', 
      category: 'design', 
      priority: 'high', 
      dueDate: 21, 
      status: 'pending', 
      assignee: 'john doe',
      recurring: 'none',
      comments: [],
      attachments: []
    },
    { 
      id: 3, 
      title: 'Daily standup meeting', 
      category: 'meeting', 
      priority: 'medium', 
      dueDate: 20, 
      status: 'pending', 
      assignee: 'abhishek varma',
      recurring: 'daily',
      comments: [],
      attachments: []
    },
    { 
      id: 4, 
      title: 'Weekly team sync', 
      category: 'meeting', 
      priority: 'medium', 
      dueDate: 22, 
      status: 'pending', 
      assignee: 'jane smith',
      recurring: 'weekly',
      comments: [],
      attachments: []
    },
  ]);

  const [comment, setComment] = useState('');

  const taskTemplates = [
    { 
      name: 'Client Meeting', 
      category: 'meeting', 
      priority: 'high', 
      estimatedTime: '60',
      description: 'Prepare agenda, review deliverables, discuss next steps'
    },
    { 
      name: 'Code Review', 
      category: 'development', 
      priority: 'medium', 
      estimatedTime: '30',
      description: 'Review pull request, check code quality, provide feedback'
    },
    { 
      name: 'Weekly Report', 
      category: 'work', 
      priority: 'medium', 
      estimatedTime: '45',
      description: 'Compile weekly metrics, update stakeholders, plan next week',
      recurring: 'weekly'
    },
    { 
      name: 'Bug Fix', 
      category: 'development', 
      priority: 'urgent', 
      estimatedTime: '120',
      description: 'Reproduce issue, identify root cause, implement fix, test'
    },
  ];

  const teamMembers = [
    'abhishek varma',
    'john doe',
    'jane smith',
    'mike wilson',
    'sarah johnson'
  ];

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

  // Generate notifications for overdue and upcoming tasks
  useEffect(() => {
    const newNotifications = [];
    tasks.forEach(task => {
      if (task.status !== 'completed') {
        if (task.dueDate < 20) {
          newNotifications.push({
            id: `overdue-${task.id}`,
            type: 'overdue',
            message: `Task "${task.title}" is overdue!`,
            taskId: task.id,
            time: 'now'
          });
        } else if (task.dueDate === 20) {
          newNotifications.push({
            id: `today-${task.id}`,
            type: 'today',
            message: `Task "${task.title}" is due today!`,
            taskId: task.id,
            time: 'today'
          });
        } else if (task.dueDate === 21) {
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

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    dueToday: tasks.filter(t => t.dueDate === 20 && t.status !== 'completed').length
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
      assignee: newTask.assignee,
      estimatedTime: newTask.estimatedTime,
      recurring: newTask.recurring,
      description: newTask.description,
      comments: [],
      attachments: []
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      category: 'work',
      priority: 'medium',
      dueDate: '2026-01-21',
      assignee: 'abhishek varma',
      estimatedTime: '',
      recurring: 'none',
      description: ''
    });
    setShowNewTaskForm(false);
  };

  const handleTemplateSelect = (template) => {
    setNewTask({
      ...newTask,
      title: template.name,
      category: template.category,
      priority: template.priority,
      estimatedTime: template.estimatedTime,
      description: template.description,
      recurring: template.recurring || 'none'
    });
    setShowTemplates(false);
    setShowNewTaskForm(true);
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
              user: 'abhishek varma',
              text: comment,
              time: 'just now'
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
        user: 'abhishek varma',
        time: 'just now'
      },
      ...teamNotes
    ]);
    setTeamNote('');
  };

  const handleDeleteNote = (noteId) => {
    setTeamNotes(teamNotes.filter(note => note.id !== noteId));
  };

  const handleEditNote = (noteId) => {
    const note = teamNotes.find(n => n.id === noteId);
    const newText = prompt('Edit note:', note.text);
    if (newText && newText.trim()) {
      setTeamNotes(teamNotes.map(n => 
        n.id === noteId ? { ...n, text: newText } : n
      ));
    }
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      // Stop timer and log work
      setTodayWorkLog([
        ...todayWorkLog,
        {
          id: Date.now(),
          duration: timerSeconds,
          startTime: new Date(Date.now() - timerSeconds * 1000).toLocaleTimeString(),
          endTime: new Date().toLocaleTimeString()
        }
      ]);
      setTimerSeconds(0);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTotalWorkedToday = () => {
    return todayWorkLog.reduce((total, log) => total + log.duration, 0) + (isTimerRunning ? timerSeconds : 0);
  };

  const getProgressPercentage = () => {
    return Math.min((getTotalWorkedToday() / dailyTarget) * 100, 100);
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
      blanks.push(<div key={`blank-${i}`} className="h-14"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayTasks = getTasksForDate(d);
      const isToday = d === 20;

      days.push(
        <div
          key={d}
          className={`h-14 border rounded-md p-1 cursor-pointer transition-all hover:border-orange-500 ${
            isToday ? 'bg-orange-500 text-white border-orange-500' : 'bg-[#1a1a1a] border-gray-800'
          }`}
        >
          <div className="text-xs font-medium mb-0.5">{d}</div>
          {dayTasks.length > 0 && (
            <div className="flex gap-0.5 flex-wrap">
              {dayTasks.slice(0, 4).map((task, idx) => (
                <div
                  key={idx}
                  className={`w-1 h-1 rounded-full ${priorityColors[task.priority].bg} ${
                    task.priority === 'urgent' ? 'animate-pulse shadow-sm shadow-red-500/50' : ''
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

  const NavButton = ({ icon: Icon, label, badge }) => (
    <div className="relative group">
      <button 
        onClick={() => label === 'Notifications' && setShowNotifications(!showNotifications)}
        className="p-2.5 rounded-lg bg-[#1a1a1a] hover:bg-gray-800 transition-colors border border-gray-800 relative"
      >
        <Icon size={18} className="text-gray-400" />
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
    ? tasks.filter(t => t.dueDate === 20)
    : tasks.filter(t => t.status === selectedFilter.toLowerCase());

  const pendingTasks = tasks.filter(t => t.status === 'pending');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">TaskFlow</h1>
              <p className="text-xs text-gray-500">Welcome, abhishek varma</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-300">1 online</span>
            </div>
            <NavButton icon={Bell} label="Notifications" badge={notifications.length} />
            <NavButton icon={Clock} label="Activity Timeline" />
            <NavButton icon={TrendingUp} label="Analytics & Reports" />
            <NavButton icon={Settings} label="Settings & Preferences" />
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

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <div className="w-1/4 border-r border-gray-900 p-4 overflow-y-auto">
          {/* Time Tracker */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4 border border-gray-800">
            <div className="flex items-center gap-2 text-green-500 mb-3">
              <Clock size={20} />
              <h3 className="font-semibold">Time Tracker</h3>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-orange-500 mb-2">
                {formatTime(isTimerRunning ? timerSeconds : getTotalWorkedToday())}
              </div>
              <p className="text-xs text-gray-500">
                {isTimerRunning ? 'Current Session' : 'Total Today'}
              </p>
            </div>

            {/* Timer Control */}
            <button
              onClick={toggleTimer}
              className={`w-full py-3 rounded-lg font-semibold transition-colors mb-3 ${
                isTimerRunning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isTimerRunning ? 'Stop Timer' : 'Start Timer'}
            </button>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Daily Goal</span>
                <span>{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatTime(getTotalWorkedToday())} / {formatTime(dailyTarget)}
              </p>
            </div>

            {/* Today's Work Log */}
            {todayWorkLog.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Today's Sessions</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {todayWorkLog.map(log => (
                    <div key={log.id} className="bg-gray-800 rounded p-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{log.startTime} - {log.endTime}</span>
                        <span className="text-green-500 font-semibold">{formatTime(log.duration)}</span>
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
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
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditNote(note.id)}
                      className="p-1 bg-blue-600 rounded hover:bg-blue-700"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 bg-red-600 rounded hover:bg-red-700"
                    >
                      <X size={12} />
                    </button>
                  </div>
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

        {/* Main Content */}
        <div className="w-1/2 p-6 overflow-y-auto">
          {/* Stats Cards */}
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

          {/* Progress Bar */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6 border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Team Progress</span>
              <span className="text-sm text-orange-500 font-semibold">
                {Math.round((stats.done / stats.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stats.done / stats.total) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* New Task Button */}
          <div className="mb-6">
            <button 
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {showNewTaskForm ? 'Cancel' : 'New Task'}
            </button>
          </div>

          {/* New Task Form */}
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
                <select 
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  className="bg-black border border-gray-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                >
                  {teamMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
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

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
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

          {/* Task List */}
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <button className="w-5 h-5 rounded-full border-2 border-gray-600 mt-0.5 hover:border-orange-500 transition-colors"></button>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{task.title}</h4>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`${categoryColors[task.category]} text-xs px-2 py-1 rounded`}>
                          {task.category}
                        </span>
                        <span className={`${priorityColors[task.priority].bg} text-xs px-2 py-1 rounded ${
                          task.priority === 'urgent' ? 'animate-pulse shadow-lg shadow-red-500/30' : ''
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
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Users size={12} />
                          {task.assignee}
                        </span>
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
                    <button className="p-2 hover:bg-gray-800 rounded-lg">
                      <Trash2 size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Comments and Attachments Section */}
                {selectedTask === task.id && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    {/* Attachments */}
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

                    {/* Comments */}
                    <div>
                      <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <MessageSquare size={14} />
                        Comments
                      </h5>
                      <div className="space-y-2 mb-3">
                        {task.comments.map(comment => (
                          <div key={comment.id} className="bg-gray-800 rounded p-3">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-semibold text-orange-500">{comment.user}</span>
                              <span className="text-xs text-gray-500">{comment.time}</span>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
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
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-1/4 border-l border-gray-900 p-6 overflow-y-auto">
          {/* Pending Tasks */}
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

          {/* Calendar */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">January 2026</h3>
              <button className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
                <Calendar size={18} className="text-orange-500" />
              </button>
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
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/50"></div>
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
                <div className="flex items-center gap-1.5">
                  <Repeat size={12} className="text-purple-400" />
                  <span className="text-gray-400">Recurring</span>
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
