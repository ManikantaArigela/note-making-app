import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { FocusSession } from '../models/FocusSession.js';
import { recordActivityEvent } from '../services/activityService.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ projectId: project._id, userId: req.user._id });
        const completedTasks = await Task.countDocuments({
          projectId: project._id,
          userId: req.user._id,
          isCompleted: true,
        });
        const focusSessions = await FocusSession.find({ projectId: project._id, userId: req.user._id });
        const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          totalFocusHours: (totalFocusMinutes / 60).toFixed(1),
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await Task.find({ projectId: project._id, userId: req.user._id }).sort({ isCompleted: 1, priority: -1 });
    const focusSessions = await FocusSession.find({ projectId: project._id, userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      project,
      tasks,
      focusSessions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, category, color, icon, deadline } = req.body;
    if (!title) return res.status(400).json({ message: 'Project title is required' });

    const project = await Project.create({
      userId: req.user._id,
      title,
      description: description || '',
      category: category || 'Development',
      color: color || '#3b82f6',
      icon: icon || 'folder',
      deadline: deadline || null,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const wasCompleted = project.status === 'completed';
    Object.assign(project, req.body);
    await project.save();

    if (project.status === 'completed' && !wasCompleted) {
      await recordActivityEvent({
        userId: req.user._id,
        eventType: 'PROJECT_COMPLETED',
        referenceId: project._id,
        referenceType: 'Project',
        title: `Completed project: "${project.title}"`,
        impactScore: 5,
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Remove project reference from associated tasks
    await Task.updateMany({ projectId: project._id }, { projectId: null });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
