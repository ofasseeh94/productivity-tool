export function beginSession(task, minutes, id, now) {
  if (!task || task.completed) throw new Error('Choose an open task.');
  if (!Number.isInteger(Number(minutes)) || Number(minutes) < 1 || Number(minutes) > 240) throw new Error('Choose 1–240 whole minutes.');
  return { id, taskId: task.id, taskTitle: task.title, plannedMinutes: Number(minutes), startedAt: now, lastSeenAt: now, runningSince: now, unpausedMs: 0, pauses: [], status: 'running', reflection: { outcome: 'partial', note: '', focusedMinutes: '' } };
}
export function elapsed(session, now) {
  return session.unpausedMs + (session.status === 'running' ? Math.max(0, now - session.runningSince) : 0);
}
export function pauseSession(session, now, reason = 'User paused') {
  if (session.status !== 'running') return;
  session.unpausedMs = elapsed(session, now); session.runningSince = null;
  session.status = 'paused'; session.lastSeenAt = now;
  session.pauses.push({ at: now, reason });
}
export function resumeSession(session, now) {
  if (session.status !== 'paused') throw new Error('Session is not paused.');
  session.status = 'running'; session.runningSince = now; session.lastSeenAt = now;
}
export function recoverSession(session) {
  if (session?.status === 'running') pauseSession(session, session.lastSeenAt, 'Page closed or reloaded; resume when ready');
}
export function endSession(session, now) {
  if (!['running', 'paused'].includes(session.status)) return;
  session.unpausedMs = elapsed(session, now); session.runningSince = null; session.endedAt = now; session.status = 'review';
}
export function finishSession(session, now) {
  if (session.status !== 'review') throw new Error('End the session before logging its result.');
  const { outcome, note, focusedMinutes } = session.reflection;
  if (!['completed', 'partial', 'stopped'].includes(outcome)) throw new Error('Choose a session outcome.');
  if (note.length > 2000) throw new Error('Keep the resumption note under 2,000 characters.');
  const focused = focusedMinutes === '' ? null : Number(focusedMinutes);
  if (focused !== null && (!Number.isFinite(focused) || focused < 0 || focused * 60000 > session.unpausedMs)) throw new Error('Focused minutes must be between zero and the unpaused minutes shown.');
  return { ...session, status: outcome, loggedAt: now, note: note.trim(), focusedMinutes: focused, wallClockMs: Math.max(0, session.endedAt - session.startedAt), pausedMs: Math.max(0, session.endedAt - session.startedAt - session.unpausedMs) };
}
