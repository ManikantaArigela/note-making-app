import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Folder } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useTasks } from '../../context/TaskContext';

export const FocusTimer = () => {
  const { triggerRefresh } = useTasks();
  const [timerMode, setTimerMode] = useState('pomodoro');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [notes, setNotes] = useState('');

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const initialDurationRef = useRef(25 * 60);

  useEffect(() => {
    axiosClient.get('/tasks?state=scheduled').then((res) => setTasks(res.data)).catch(() => {});
    axiosClient.get('/projects').then((res) => setProjects(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleFinishSession();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const setDuration = (mins, mode = 'pomodoro') => {
    setIsActive(false);
    setIsCompleted(false);
    setTimerMode(mode);
    setCustomMinutes(mins);
    const totalSecs = mins * 60;
    setTimeLeft(totalSecs);
    initialDurationRef.current = totalSecs;
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setTimeLeft(initialDurationRef.current);
  };

  const playChimeSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    } catch (e) {}
  };

  const handleFinishSession = async () => {
    playChimeSound();
    setIsCompleted(true);

    const loggedMins = Math.max(1, Math.round(initialDurationRef.current / 60));

    try {
      await axiosClient.post('/focus', {
        taskId: selectedTask || null,
        projectId: selectedProject || null,
        durationMinutes: loggedMins,
        sessionType: timerMode,
        notes,
      });
      triggerRefresh();
    } catch (err) {
      console.error('Error logging focus session:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.round(
    ((initialDurationRef.current - timeLeft) / initialDurationRef.current) * 100
  );

  return (
    <div className="bg-white border border-[#e2e5dc] rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-sm space-y-8 select-none text-slate-800">
      {/* Modes Toggle */}
      <div className="flex items-center justify-center gap-2 bg-[#f4f5f0] p-1.5 rounded-2xl border border-[#e2e5dc] w-fit mx-auto">
        <button
          onClick={() => setDuration(25, 'pomodoro')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            timerMode === 'pomodoro' && customMinutes === 25
              ? 'bg-[#1b3b2b] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pomodoro (25m)
        </button>
        <button
          onClick={() => setDuration(50, 'pomodoro')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            timerMode === 'pomodoro' && customMinutes === 50
              ? 'bg-[#1b3b2b] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Deep Work (50m)
        </button>
        <button
          onClick={() => setDuration(15, 'custom')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            timerMode === 'custom'
              ? 'bg-[#1b3b2b] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Short Focus (15m)
        </button>
      </div>

      {/* Timer Radial Display */}
      <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="128" cy="128" r="110" stroke="#e2e8f0" strokeWidth="10" fill="transparent" />
          <circle
            cx="128"
            cy="128"
            r="110"
            stroke="#1b3b2b"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 110}
            strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-extrabold text-slate-900 tracking-tight font-mono">{formatTime(timeLeft)}</span>
          <span className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-wider">
            {isActive ? 'Deep Work Session' : isCompleted ? 'Session Complete! 🎉' : 'Ready to focus'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleStartPause}
          className="w-14 h-14 rounded-2xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
        >
          {isActive ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
        </button>

        <button
          onClick={handleReset}
          className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 active:scale-95 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Context Linking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#1b3b2b]" /> Link Task
          </label>
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1b3b2b]"
          >
            <option value="">No Task Linked</option>
            {tasks.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-[#1b3b2b]" /> Link Project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#1b3b2b]"
          >
            <option value="">No Project Linked</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
