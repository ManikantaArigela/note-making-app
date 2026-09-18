import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useTasks } from '../context/TaskContext';
import {
  Route,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  FileText,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  X,
  Sparkles,
  ArrowRight,
  Search,
  CheckSquare,
  Clock,
  Check,
} from 'lucide-react';

export const RoadmapPage = () => {
  const { toggleTaskCompletion, refreshTrigger, triggerRefresh } = useTasks();
  const [roadmaps, setRoadmaps] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});

  // Filters & Search
  const [dayFilter, setDayFilter] = useState('all'); // all, today, pending, completed
  const [searchQuery, setSearchQuery] = useState('');

  // Add Task to Day Modal
  const [addTaskModalDay, setAddTaskModalDay] = useState(null);
  const [newDayTaskTitle, setNewDayTaskTitle] = useState('');
  const [newDayTaskDesc, setNewDayTaskDesc] = useState('');

  // Form State for New Roadmap
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Learning');
  const [projectId, setProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  useEffect(() => {
    if (activeRoadmapId) {
      fetchRoadmapDetails(activeRoadmapId);
    }
  }, [activeRoadmapId, refreshTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rmRes, projRes] = await Promise.all([
        axiosClient.get('/roadmaps'),
        axiosClient.get('/projects'),
      ]);
      const rms = rmRes.data || [];
      setRoadmaps(rms);
      setProjects(projRes.data || []);

      if (rms.length > 0 && !activeRoadmapId) {
        setActiveRoadmapId(rms[0]._id);
      }
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmapDetails = async (id) => {
    try {
      const { data } = await axiosClient.get(`/roadmaps/${id}`);
      setSelectedRoadmap(data);
      const initialExpanded = {};
      data.days?.forEach((day) => {
        initialExpanded[day.dayNumber] = true;
      });
      setExpandedDays(initialExpanded);
    } catch (err) {
      console.error('Error fetching roadmap detail:', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setRawContent(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleSampleTemplate = () => {
    const today = new Date().toISOString().split('T')[0];
    const sample = `Day 1: Full-Stack Project Architecture & Setup
- Initialize Git repository and structure frontend/backend directories
- Setup Express server with CORS, dotenv, and MongoDB connection
- Create Mongoose schemas for User, Task, and Project models

Day 2: User Authentication & Security Layer
- Build JWT authentication middleware and login/register endpoints
- Connect React Auth Context with persistent localStorage token
- Create protected routes and session verification hooks

Day 3: Roadmap Parser & Automated Daily Task System
- Implement regex parser algorithm for extracting daily roadmap items
- Automatically compute calendar dates from Start Date picker
- Schedule task documents in MongoDB linked to Roadmap ID

Day 4: Interactive Dashboard & Today Page Integration
- Integrate scheduled roadmap tasks with Today's Tasks API endpoint
- Add real-time task toggle completion and progress percentage bars
- Build filter tabs for Day-by-Day schedule view

Day 5: Testing, Optimization & Deployment
- Write API unit test suites for task controllers
- Optimize database indexing on scheduledDate and userId fields
- Build production bundle with Vite and deploy fullstack application`;

    setTitle('Full-Stack Web App 5-Day Sprint Roadmap');
    setRawContent(sample);
    setStartDate(today);
  };

  const handleCreateRoadmap = async (e) => {
    e.preventDefault();
    if (!title || !rawContent) {
      setErrorMsg('Please enter roadmap title and text content');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const { data } = await axiosClient.post('/roadmaps/generate', {
        title,
        description,
        rawContent,
        startDate,
        category,
        projectId: projectId || null,
      });

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setRawContent('');
      setProjectId('');
      triggerRefresh();
      await fetchData();
      if (data.roadmap?._id) {
        setActiveRoadmapId(data.roadmap._id);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate roadmap tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoadmap = async (id) => {
    if (!window.confirm('Are you sure you want to delete this roadmap and all its generated daily tasks?')) {
      return;
    }

    try {
      await axiosClient.delete(`/roadmaps/${id}`);
      triggerRefresh();
      const updatedRms = roadmaps.filter((r) => r._id !== id);
      setRoadmaps(updatedRms);
      if (updatedRms.length > 0) {
        setActiveRoadmapId(updatedRms[0]._id);
      } else {
        setActiveRoadmapId(null);
        setSelectedRoadmap(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTaskToDay = async (e) => {
    e.preventDefault();
    if (!newDayTaskTitle || !addTaskModalDay) return;

    try {
      await axiosClient.post(`/roadmaps/${selectedRoadmap._id}/add-task`, {
        dayNumber: addTaskModalDay.dayNumber,
        title: newDayTaskTitle,
        description: newDayTaskDesc,
      });
      setAddTaskModalDay(null);
      setNewDayTaskTitle('');
      setNewDayTaskDesc('');
      triggerRefresh();
      fetchRoadmapDetails(selectedRoadmap._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDayAll = async (dayNumber, currentlyCompleted) => {
    try {
      await axiosClient.patch(`/roadmaps/${selectedRoadmap._id}/toggle-day`, {
        dayNumber,
        completed: !currentlyCompleted,
      });
      triggerRefresh();
      fetchRoadmapDetails(selectedRoadmap._id);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDayExpanded = (dayNum) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering Days
  const filteredDays = selectedRoadmap?.days?.filter((day) => {
    const isToday = day.dateStr === todayStr;
    const dayCompletedCount = day.tasks?.filter((t) => t.taskId?.isCompleted).length || 0;
    const dayTotalCount = day.tasks?.length || 0;
    const isDone = dayTotalCount > 0 && dayCompletedCount === dayTotalCount;

    if (dayFilter === 'today' && !isToday) return false;
    if (dayFilter === 'pending' && isDone) return false;
    if (dayFilter === 'completed' && !isDone) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = day.title.toLowerCase().includes(q);
      const matchesTasks = day.tasks?.some((t) => t.title.toLowerCase().includes(q));
      if (!matchesTitle && !matchesTasks) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Route className="w-6 h-6 text-[#1b3b2b]" />
            <span>Roadmap & Daily Schedule</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated date scheduling & task breakdown for your roadmap
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Import Roadmap</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading roadmaps...</div>
      ) : roadmaps.length === 0 ? (
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#f4f5f0] flex items-center justify-center mx-auto text-[#1b3b2b]">
            <Route className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No active roadmaps found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Paste or upload your roadmap file. All daily tasks will be automatically parsed, dated, and synced to
              your Today's Tasks!
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b3b2b] text-white text-xs font-bold shadow-sm hover:bg-[#132c1f] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create First Roadmap</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Roadmap Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#e2e5dc]">
            {roadmaps.map((rm) => {
              const isActive = activeRoadmapId === rm._id;
              return (
                <button
                  key={rm._id}
                  onClick={() => setActiveRoadmapId(rm._id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#1b3b2b] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-[#e2e5dc] hover:bg-slate-100'
                  }`}
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>{rm.title}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rm.progress}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Roadmap Banner & Overview */}
          {selectedRoadmap && (
            <div className="bg-white border border-[#e2e5dc] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#d6e2d5] text-[#1b3b2b] uppercase tracking-wider">
                      {selectedRoadmap.category}
                    </span>
                    {selectedRoadmap.projectId && (
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white flex items-center gap-1"
                        style={{ backgroundColor: selectedRoadmap.projectId.color || '#1b3b2b' }}
                      >
                        <FolderKanban className="w-3 h-3" />
                        {selectedRoadmap.projectId.title}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedRoadmap.title}</h2>
                  {selectedRoadmap.description && (
                    <p className="text-xs text-slate-500">{selectedRoadmap.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-700">
                      {selectedRoadmap.completedTasks} of {selectedRoadmap.totalTasks} Tasks Completed
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Start Date:{' '}
                      {new Date(selectedRoadmap.startDate + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRoadmap(selectedRoadmap._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
                    title="Delete Roadmap"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Overall Progress</span>
                  <span className="text-[#1b3b2b] font-bold">{selectedRoadmap.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-[#1b3b2b] rounded-full transition-all duration-300"
                    style={{ width: `${selectedRoadmap.progress}%` }}
                  />
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {[
                    { id: 'all', label: 'All Days' },
                    { id: 'today', label: "Today's Schedule" },
                    { id: 'pending', label: 'Pending' },
                    { id: 'completed', label: 'Completed' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setDayFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        dayFilter === filter.id
                          ? 'bg-[#1b3b2b] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search daily tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b]"
                  />
                </div>
              </div>

              {/* Day-by-Day Schedule List */}
              <div className="space-y-4">
                {filteredDays?.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    No days found matching the selected filter.
                  </div>
                ) : (
                  filteredDays?.map((day) => {
                    const isToday = day.dateStr === todayStr;
                    const dayCompletedCount = day.tasks?.filter((t) => t.taskId?.isCompleted).length || 0;
                    const dayTotalCount = day.tasks?.length || 0;
                    const isDayDone = dayTotalCount > 0 && dayCompletedCount === dayTotalCount;
                    const isExpanded = expandedDays[day.dayNumber];

                    const formattedDayDate = new Date(day.dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <div
                        key={day.dayNumber}
                        className={`border rounded-2xl overflow-hidden transition-all ${
                          isToday
                            ? 'border-[#1b3b2b] bg-[#f4f7f4] shadow-md ring-2 ring-[#1b3b2b]/20'
                            : isDayDone
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : 'border-[#e2e5dc] bg-white'
                        }`}
                      >
                        {/* Day Header */}
                        <div className="px-5 py-3.5 flex items-center justify-between select-none bg-slate-50/50 border-b border-slate-100">
                          <div
                            onClick={() => toggleDayExpanded(day.dayNumber)}
                            className="flex items-center gap-3 cursor-pointer flex-1"
                          >
                            <span
                              className={`w-8 h-8 rounded-xl text-xs font-extrabold flex items-center justify-center shadow-sm shrink-0 ${
                                isToday
                                  ? 'bg-[#1b3b2b] text-white'
                                  : isDayDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              D{day.dayNumber}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900">{day.title}</h4>
                                {isToday && (
                                  <span className="px-2 py-0.5 rounded-md bg-[#1b3b2b] text-white text-[10px] font-extrabold animate-pulse">
                                    TODAY
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500">{formattedDayDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Complete All Day Tasks Toggle */}
                            <button
                              onClick={() => handleToggleDayAll(day.dayNumber, isDayDone)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                                isDayDone
                                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                              title="Toggle completion for all tasks on this day"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isDayDone ? 'Completed' : 'Mark Day Done'}</span>
                            </button>

                            {/* Add Task to Day Button */}
                            <button
                              onClick={() => setAddTaskModalDay(day)}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#1b3b2b] hover:bg-slate-100 transition-colors"
                              title="Add task to this day"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

                            <button onClick={() => toggleDayExpanded(day.dayNumber)} className="p-1 text-slate-400">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Day Tasks List */}
                        {isExpanded && (
                          <div className="px-5 py-3 space-y-2 bg-white">
                            {day.tasks?.length === 0 ? (
                              <div className="text-center py-3 text-[11px] text-slate-400">
                                No tasks scheduled for this day yet.
                              </div>
                            ) : (
                              day.tasks?.map((t, idx) => {
                                const taskObj = t.taskId;
                                const isCompleted = taskObj?.isCompleted || false;

                                return (
                                  <div
                                    key={idx}
                                    className="flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors"
                                  >
                                    <div className="flex items-start gap-3">
                                      <button
                                        onClick={async () => {
                                          if (taskObj?._id) {
                                            await toggleTaskCompletion(taskObj._id);
                                            fetchRoadmapDetails(selectedRoadmap._id);
                                          }
                                        }}
                                        className="mt-0.5 text-slate-400 hover:text-[#1b3b2b] transition-colors"
                                      >
                                        {isCompleted ? (
                                          <CheckCircle2 className="w-4 h-4 text-[#1b3b2b]" />
                                        ) : (
                                          <Circle className="w-4 h-4" />
                                        )}
                                      </button>
                                      <div>
                                        <span
                                          className={`text-xs font-medium block ${
                                            isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                                          }`}
                                        >
                                          {t.title}
                                        </span>
                                        {t.description && (
                                          <span className="text-[11px] text-slate-500 block mt-0.5">
                                            {t.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {isToday && (
                                      <span className="text-[10px] text-[#1b3b2b] bg-[#d6e2d5] font-bold px-2 py-0.5 rounded-md shrink-0">
                                        Synced to Today
                                      </span>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal for Creating / Importing Roadmap */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2e5dc] rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Route className="w-4 h-4 text-[#1b3b2b]" />
                <span>Import & Schedule Roadmap</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateRoadmap} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Roadmap Title</label>
                  <input
                    type="text"
                    placeholder="e.g. MERN Stack 30 Days Roadmap"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
                  >
                    <option value="Learning">Learning</option>
                    <option value="Code">Code</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Link to Project (Optional)</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
                  >
                    <option value="">No Project (Standalone Roadmap)</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#1b3b2b]" />
                    <span>Roadmap Content / File Text</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSampleTemplate}
                      className="text-[10px] text-[#1b3b2b] hover:underline font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Load Sample
                    </button>
                    <label className="cursor-pointer text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload File (.md, .txt)</span>
                      <input type="file" accept=".txt,.md,.json" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
                <textarea
                  placeholder={`Paste your roadmap file or text here. Format example:\n\nDay 1: React Basics\n- Learn components & props\n- Build first state hook\n\nDay 2: Node.js Express\n- Setup REST API routes`}
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  rows={8}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b] font-mono text-xs leading-relaxed resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Generating Tasks...' : 'Generate Daily Tasks'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding Custom Task to a Day */}
      {addTaskModalDay && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2e5dc] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#1b3b2b]" />
                <span>Add Task to Day {addTaskModalDay.dayNumber}</span>
              </h2>
              <button onClick={() => setAddTaskModalDay(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTaskToDay} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Complete practice exercises"
                  value={newDayTaskTitle}
                  onChange={(e) => setNewDayTaskTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Task details or notes..."
                  value={newDayTaskDesc}
                  onChange={(e) => setNewDayTaskDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddTaskModalDay(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white font-bold"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
