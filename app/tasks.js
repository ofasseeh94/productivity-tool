export function taskErrors(input, goals) {
  const errors = {};
  if (!String(input.title || '').trim()) errors.title = 'Write an action to capture.';
  else if (input.title.length > 2000) errors.title = 'Keep the task under 2,000 characters.';
  if (input.minutes !== '' && input.minutes !== null && input.minutes !== undefined) {
    const minutes = Number(input.minutes);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) errors.minutes = 'Choose a whole number from 1 to 1,440, or leave blank.';
  }
  if (input.goalId && !goals.some(goal => goal.id === input.goalId)) errors.goalId = 'Choose an existing goal.';
  return errors;
}
export function makeTask(input, goals, id, now) {
  if (Object.keys(taskErrors(input, goals)).length) throw new Error('Invalid task');
  return { id, title: input.title.trim(), minutes: input.minutes === '' || input.minutes == null ? null : Number(input.minutes), goalId: input.goalId || null, completed: false, createdAt: now, source: 'inbox' };
}
export function taskRows(state) {
  return [
    ...state.goals.map(goal => ({ ...goal.task, id: 'first:' + goal.id, goalId: goal.id, source: 'quick-start' })),
    ...state.tasks,
  ];
}
export function findTask(state, id) {
  if (id.startsWith('first:')) return state.goals.find(goal => goal.id === id.slice(6))?.task;
  return state.tasks.find(task => task.id === id);
}
