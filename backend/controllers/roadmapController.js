import { Roadmap } from '../models/Roadmap.js';
import { Task } from '../models/Task.js';

// Helper to add days to a YYYY-MM-DD date string accurately without timezone shift
const addDaysToDate = (dateStr, daysToAdd) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + daysToAdd);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Clean markdown syntax from text
const cleanMarkdown = (text) => {
  return text
    .replace(/^#+\s*/, '')
    .replace(/^\*\*|\*\*$/g, '')
    .replace(/^__|\__$/g, '')
    .trim();
};

// Smart parser for roadmap raw text supporting multiple formats
const parseRoadmapText = (rawContent, startDateStr) => {
  const lines = rawContent.split(/\r?\n/);
  const days = [];
  let currentDay = null;
  let dayCounter = 0;

  // Regex patterns
  const dayRegex = /^(?:#+\s*|\*\*\s*|--\s*|\*\s*)?(?:Week\s*\d+\s*[-:]?\s*)?(?:Day|Phase|Module|Step|Lesson)\s*(\d+)[:\-]?\s*(.*)/i;
  const dateRegex = /^(?:#+\s*|\*\*\s*)?Date[:\-]?\s*(\d{4}-\d{2}-\d{2})[:\-]?\s*(.*)/i;
  const headingRegex = /^#{1,4}\s+(.+)/;
  const numberedListRegex = /^(\d+)\.\s+(.+)/;

  // Check if text has explicit "Day X" or heading lines
  const hasExplicitDays = lines.some((l) => dayRegex.test(l.trim()) || dateRegex.test(l.trim()));

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const dayMatch = trimmed.match(dayRegex);
    const dateMatch = trimmed.match(dateRegex);
    const headingMatch = trimmed.match(headingRegex);
    const numberedMatch = trimmed.match(numberedListRegex);

    if (dayMatch) {
      const dayNum = parseInt(dayMatch[1], 10);
      const rawTitle = dayMatch[2] ? cleanMarkdown(dayMatch[2]) : `Day ${dayNum}`;
      dayCounter = dayNum;

      const dateStr = addDaysToDate(startDateStr, dayCounter - 1);
      currentDay = {
        dayNumber: dayCounter,
        dateStr,
        title: rawTitle || `Day ${dayCounter}`,
        tasks: [],
      };
      days.push(currentDay);
    } else if (dateMatch) {
      dayCounter++;
      const explicitDate = dateMatch[1];
      const rawTitle = dateMatch[2] ? cleanMarkdown(dateMatch[2]) : `Day ${dayCounter}`;
      currentDay = {
        dayNumber: dayCounter,
        dateStr: explicitDate,
        title: rawTitle,
        tasks: [],
      };
      days.push(currentDay);
    } else if (!hasExplicitDays && headingMatch) {
      dayCounter++;
      const dateStr = addDaysToDate(startDateStr, dayCounter - 1);
      currentDay = {
        dayNumber: dayCounter,
        dateStr,
        title: cleanMarkdown(headingMatch[1]),
        tasks: [],
      };
      days.push(currentDay);
    } else if (!hasExplicitDays && numberedMatch && !currentDay) {
      // Treat numbered list items as sequential daily topics
      dayCounter = parseInt(numberedMatch[1], 10);
      const dateStr = addDaysToDate(startDateStr, dayCounter - 1);
      const content = cleanMarkdown(numberedMatch[2]);

      currentDay = {
        dayNumber: dayCounter,
        dateStr,
        title: `Day ${dayCounter}: ${content}`,
        tasks: [{ title: content, description: '' }],
      };
      days.push(currentDay);
      // Reset currentDay to null so subsequent items get their own day if needed
      currentDay = null;
    } else {
      // It's a task/sub-item under the current day
      // Strip bullet points: -, *, 1., •
      const taskText = trimmed.replace(/^[-*•]\s*|^\d+\.\s*/, '').trim();

      if (taskText) {
        if (!currentDay) {
          dayCounter = 1;
          currentDay = {
            dayNumber: 1,
            dateStr: startDateStr,
            title: 'Day 1 Tasks',
            tasks: [],
          };
          days.push(currentDay);
        }

        // Split task title and description if colon present (e.g., "React Hooks: Learn useState and useEffect")
        let taskTitle = taskText;
        let taskDesc = '';

        if (taskText.includes(': ') && !taskText.startsWith('http')) {
          const parts = taskText.split(': ');
          taskTitle = cleanMarkdown(parts[0]);
          taskDesc = cleanMarkdown(parts.slice(1).join(': '));
        } else {
          taskTitle = cleanMarkdown(taskText);
        }

        currentDay.tasks.push({
          title: taskTitle,
          description: taskDesc,
        });
      }
    }
  });

  return days;
};

// Create Roadmap and automatically generate scheduled tasks
export const createRoadmap = async (req, res) => {
  try {
    const { title, description, rawContent, startDate, projectId, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Roadmap title is required' });
    }
    if (!rawContent) {
      return res.status(400).json({ message: 'Roadmap text content is required' });
    }

    const initialStartDate = startDate || new Date().toISOString().split('T')[0];
    const parsedDays = parseRoadmapText(rawContent, initialStartDate);

    if (parsedDays.length === 0) {
      return res.status(400).json({ message: 'Could not parse any daily tasks from the roadmap text' });
    }

    const processedDays = [];
    let createdTasksCount = 0;

    for (const day of parsedDays) {
      const dayTasks = [];

      for (const t of day.tasks) {
        const createdTask = await Task.create({
          userId: req.user._id,
          title: t.title,
          description: t.description || `Roadmap: ${title} (${day.title})`,
          category: category || 'Learning',
          priority: 'medium',
          state: 'scheduled',
          scheduledDate: day.dateStr,
          projectId: projectId || null,
          labels: ['Roadmap', `Day ${day.dayNumber}`],
        });

        createdTasksCount++;
        dayTasks.push({
          title: t.title,
          description: t.description || '',
          taskId: createdTask._id,
        });
      }

      processedDays.push({
        dayNumber: day.dayNumber,
        dateStr: day.dateStr,
        title: day.title,
        tasks: dayTasks,
      });
    }

    const roadmap = await Roadmap.create({
      userId: req.user._id,
      title,
      description: description || '',
      rawContent,
      startDate: initialStartDate,
      category: category || 'Learning',
      projectId: projectId || null,
      days: processedDays,
    });

    res.status(201).json({
      roadmap,
      createdTasksCount,
      message: `Successfully created roadmap with ${createdTasksCount} daily tasks across ${processedDays.length} days!`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all roadmaps with enriched progress stats
export const getRoadmaps = async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = { userId: req.user._id };
    if (projectId) filter.projectId = projectId;

    const roadmaps = await Roadmap.find(filter)
      .populate('projectId', 'title color')
      .populate({
        path: 'days.tasks.taskId',
        select: 'isCompleted title scheduledDate priority state category',
      })
      .sort({ createdAt: -1 });

    const enriched = roadmaps.map((rm) => {
      let totalTasks = 0;
      let completedTasks = 0;

      rm.days.forEach((day) => {
        day.tasks.forEach((t) => {
          totalTasks++;
          if (t.taskId && t.taskId.isCompleted) {
            completedTasks++;
          }
        });
      });

      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...rm.toObject(),
        totalTasks,
        completedTasks,
        totalDays: rm.days.length,
        progress,
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single roadmap details
export const getRoadmapById = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('projectId', 'title color')
      .populate({
        path: 'days.tasks.taskId',
        select: 'isCompleted title description scheduledDate priority state category',
      });

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    let totalTasks = 0;
    let completedTasks = 0;

    roadmap.days.forEach((day) => {
      day.tasks.forEach((t) => {
        totalTasks++;
        if (t.taskId && t.taskId.isCompleted) {
          completedTasks++;
        }
      });
    });

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      ...roadmap.toObject(),
      totalTasks,
      completedTasks,
      totalDays: roadmap.days.length,
      progress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a custom task to a specific day in roadmap
export const addTaskToRoadmapDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayNumber, title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const roadmap = await Roadmap.findOne({ _id: id, userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    const dayObj = roadmap.days.find((d) => d.dayNumber === Number(dayNumber));
    if (!dayObj) {
      return res.status(404).json({ message: 'Day not found in roadmap' });
    }

    // Create Mongo Task
    const createdTask = await Task.create({
      userId: req.user._id,
      title,
      description: description || `Roadmap: ${roadmap.title} (${dayObj.title})`,
      category: roadmap.category || 'Learning',
      priority: 'medium',
      state: 'scheduled',
      scheduledDate: dayObj.dateStr,
      projectId: roadmap.projectId || null,
      labels: ['Roadmap', `Day ${dayObj.dayNumber}`],
    });

    dayObj.tasks.push({
      title,
      description: description || '',
      taskId: createdTask._id,
    });

    await roadmap.save();

    res.status(201).json({ message: 'Task added to roadmap day successfully', createdTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete or uncomplete all tasks in a day
export const toggleDayCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayNumber, completed } = req.body;

    const roadmap = await Roadmap.findOne({ _id: id, userId: req.user._id }).populate('days.tasks.taskId');
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

    const dayObj = roadmap.days.find((d) => d.dayNumber === Number(dayNumber));
    if (!dayObj) return res.status(404).json({ message: 'Day not found' });

    const taskIds = dayObj.tasks.map((t) => t.taskId?._id).filter(Boolean);
    const todayStr = new Date().toISOString().split('T')[0];

    if (completed) {
      await Task.updateMany(
        { _id: { $in: taskIds } },
        { isCompleted: true, completedAt: new Date(), completedDateStr: todayStr, state: 'completed' }
      );
    } else {
      await Task.updateMany(
        { _id: { $in: taskIds } },
        { isCompleted: false, completedAt: null, completedDateStr: null, state: 'scheduled' }
      );
    }

    res.json({ message: `Updated all tasks for Day ${dayNumber}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete roadmap and clean up associated tasks
export const deleteRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    const taskIds = [];
    roadmap.days.forEach((day) => {
      day.tasks.forEach((t) => {
        if (t.taskId) taskIds.push(t.taskId);
      });
    });

    if (taskIds.length > 0) {
      await Task.deleteMany({ _id: { $in: taskIds }, userId: req.user._id });
    }

    await Roadmap.findByIdAndDelete(roadmap._id);

    res.json({ message: `Roadmap and its ${taskIds.length} daily tasks deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
