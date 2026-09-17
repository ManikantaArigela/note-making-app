import { FocusSession } from '../models/FocusSession.js';
import { recordActivityEvent } from '../services/activityService.js';

export const logFocusSession = async (req, res) => {
  try {
    const { taskId, projectId, durationMinutes, sessionType, notes } = req.body;

    if (!durationMinutes || durationMinutes <= 0) {
      return res.status(400).json({ message: 'Valid focus duration is required' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const session = await FocusSession.create({
      userId: req.user._id,
      taskId: taskId || null,
      projectId: projectId || null,
      durationMinutes,
      sessionType: sessionType || 'pomodoro',
      completedDateStr: todayStr,
      notes: notes || '',
    });

    const impactScore = Math.max(1, Math.round(durationMinutes / 15));

    const activityData = await recordActivityEvent({
      userId: req.user._id,
      eventType: 'FOCUS_COMPLETED',
      referenceId: session._id,
      referenceType: 'FocusSession',
      title: `Logged ${durationMinutes} mins focus time (${sessionType || 'pomodoro'})`,
      impactScore,
      metadata: { durationMinutes, sessionType, taskId, projectId },
    });

    const populated = await FocusSession.findById(session._id)
      .populate('taskId', 'title')
      .populate('projectId', 'title color');

    res.status(201).json({ session: populated, activityData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFocusHistory = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const sessions = await FocusSession.find({ userId: req.user._id })
      .populate('taskId', 'title')
      .populate('projectId', 'title color')
      .sort({ createdAt: -1 })
      .limit(50);

    const allSessions = await FocusSession.find({ userId: req.user._id });
    const todaySessions = allSessions.filter((s) => s.completedDateStr === todayStr);

    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalMinutes = allSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    res.json({
      sessions,
      todayMinutes,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
