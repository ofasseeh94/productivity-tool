export function dayKey(now = Date.now(), offset = 0) {
  const date = new Date(now); date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function makeDayPlan(draft, tasks, date, now) {
  const ids = draft.priorityIds.filter(Boolean);
  if (ids.length > 3 || new Set(ids).size !== ids.length) throw new Error('Choose up to three different priorities.');
  const priorities = ids.map(id => {
    const task = tasks.find(t => t.id === id);
    if (!task) throw new Error('A selected task is no longer available.');
    return { taskId: id, title: task.title, minutes: task.minutes ?? null };
  });
  const capacityMinutes = draft.capacity === '' ? null : Number(draft.capacity);
  if (capacityMinutes !== null && (!Number.isInteger(capacityMinutes) || capacityMinutes < 0 || capacityMinutes > 1440)) throw new Error('Available minutes must be a whole number from 0 to 1,440, or blank.');
  const estimatedMinutes = priorities.reduce((sum, p) => sum + (p.minutes || 0), 0);
  if (capacityMinutes !== null && estimatedMinutes > capacityMinutes) throw new Error('Known task estimates exceed your available time. Reduce priorities or adjust capacity.');
  return { date, priorities, capacityMinutes, estimatedMinutes, unknownEstimates: priorities.filter(p => p.minutes === null).length, note: draft.note.trim(), savedAt: now };
}
export function unfinishedPriorities(plans, tasks, beforeDate) {
  const seen = new Set(); const result = [];
  for (const plan of Object.values(plans).filter(p => p.date < beforeDate).sort((a,b) => b.date.localeCompare(a.date))) {
    for (const priority of plan.priorities) {
      const task = tasks.find(t => t.id === priority.taskId);
      if (task && !task.completed && !seen.has(task.id)) { seen.add(task.id); result.push({ ...task, plannedDate: plan.date }); }
    }
  }
  return result;
}
