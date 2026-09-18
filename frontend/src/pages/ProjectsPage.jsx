import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { FolderKanban, Plus, X, Route, Calendar, CheckCircle2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const ProjectsPage = () => {
  const { triggerRefresh, refreshTrigger } = useTasks();
  const [projects, setProjects] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development');
  const [color, setColor] = useState('#1b3b2b');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchProjectsAndRoadmaps();
  }, [refreshTrigger]);

  const fetchProjectsAndRoadmaps = async () => {
    try {
      setLoading(true);
      const [projRes, rmRes] = await Promise.all([
        axiosClient.get('/projects'),
        axiosClient.get('/roadmaps'),
      ]);
      setProjects(projRes.data || []);
      setRoadmaps(rmRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      await axiosClient.post('/projects', {
        title,
        description,
        category,
        color,
        deadline: deadline || null,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      fetchProjectsAndRoadmaps();
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#1b3b2b]" />
            <span>Projects & Initiative Workflows</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Organize multi-task initiatives and track roadmap progress</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-[#e2e5dc] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#f4f5f0] flex items-center justify-center mx-auto text-slate-600">
            <FolderKanban className="w-6 h-6 text-[#1b3b2b]" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No active projects</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Group your tasks into projects like "CIEverse", "Data Engineering", or "MERN Learning".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const projectRoadmaps = roadmaps.filter((r) => r.projectId?._id === project._id || r.projectId === project._id);

            return (
              <div
                key={project._id}
                className="bg-white border border-[#e2e5dc] hover:border-slate-400/60 rounded-2xl p-5 shadow-sm space-y-4 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: project.color || '#1b3b2b' }}
                    />
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">{project.title}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {project.category}
                  </span>
                </div>

                {project.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{project.description}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Tasks</span>
                    <span className="font-bold text-slate-900">
                      {project.completedTasks}/{project.totalTasks}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Focus Hours</span>
                    <span className="font-bold text-[#1b3b2b]">{project.totalFocusHours}h</span>
                  </div>
                </div>

                {/* Attached Roadmaps */}
                {projectRoadmaps.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Attached Roadmap
                    </span>
                    {projectRoadmaps.map((rm) => (
                      <div key={rm._id} className="bg-[#f4f7f4] border border-[#d6e2d5] rounded-xl p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                          <span className="flex items-center gap-1">
                            <Route className="w-3.5 h-3.5 text-[#1b3b2b]" />
                            {rm.title}
                          </span>
                          <span className="text-[#1b3b2b]">{rm.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1b3b2b] rounded-full transition-all duration-300"
                            style={{ width: `${rm.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-500">Overall Progress</span>
                    <span className="text-[#1b3b2b] font-bold">{project.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-[#1b3b2b] rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2e5dc] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#1b3b2b]" />
                <span>Create New Project</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. CIEverse Project"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  placeholder="What is the scope of this project?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b3b2b] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b3b2b]"
                  >
                    <option value="Development">Development</option>
                    <option value="Learning">Learning</option>
                    <option value="Personal">Personal</option>
                    <option value="Design">Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Color Theme</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl p-1 cursor-pointer"
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#132c1f] text-white font-bold"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
