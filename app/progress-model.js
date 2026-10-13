import { taskRows } from './tasks.js';
export function periods(now, days = 7) {
  const end = new Date(now); end.setHours(0, 0, 0, 0); end.setDate(end.getDate() + 1);
  const start = new Date(end); start.setDate(start.getDate() - days);
  const previous = new Date(start); previous.setDate(previous.getDate() - days);
  return { start: +start, end: +end, previous: +previous };
}
export function summarize(sessions, start, end) {
  const records = sessions.filter(s => Number.isFinite(s.endedAt) && s.endedAt >= start && s.endedAt < end && ['completed','partial','stopped'].includes(s.status));
  return records.reduce((total, s) => {
    total.attempts++;
    total[s.status]++;
    total.plannedMinutes += Number(s.plannedMinutes) || 0;
    total.unpausedMinutes += (Number(s.unpausedMs) || 0) / 60000;
    total.pausedMinutes += (Number(s.pausedMs) || 0) / 60000;
    if (s.focusedMinutes !== null && s.focusedMinutes !== undefined && Number.isFinite(Number(s.focusedMinutes))) { total.focusedMinutes += Number(s.focusedMinutes); total.focusedReports++; }
    return total;
  }, { attempts: 0, completed: 0, partial: 0, stopped: 0, plannedMinutes: 0, unpausedMinutes: 0, pausedMinutes: 0, focusedMinutes: 0, focusedReports: 0 });
}
export function goalSnapshot(state, goal) {
  const tasks = taskRows(state).filter(task => task.goalId === goal.id);
  return { total: tasks.length, completed: tasks.filter(task => task.completed).length, milestoneCompleted: goal.milestoneCompleted === true };
}
export function dailyRecords(sessions, start, end) {
  const days = [];
  for (let cursor = new Date(start); +cursor < end;) {
    const from = +cursor; cursor.setDate(cursor.getDate() + 1);
    days.push({ date: from, ...summarize(sessions, from, +cursor) });
  }
  return days;
}
