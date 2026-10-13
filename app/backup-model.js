const record = value => value && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.length <= 10000;
const finite = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
export function replaceState(state, replacement, persist) {
  const old = structuredClone(state);
  for (const key of Object.keys(state)) delete state[key]; Object.assign(state, replacement);
  try { if (persist()) return true; } catch {}
  for (const key of Object.keys(state)) delete state[key]; Object.assign(state, old);
  return false;
}
export function parseBackup(raw) {
  if (raw.length > 5000000) throw new Error('Backup exceeds the 5 MB limit.');
  let data; try { data = JSON.parse(raw); } catch { throw new Error('Choose a valid JSON backup.'); }
  const fail = message => { throw new Error(message); };
  if (!record(data) || data.version !== 1 || !record(data.draft) || !Array.isArray(data.goals) || !Array.isArray(data.tasks)) fail('Use a full-data backup from Inbox or Backup & Restore. Goal-only exports are not supported.');
  if (data.goals.length + data.tasks.length > 10000) fail('Backup contains too many goals or tasks.');
  const task = t => record(t) && text(t.title) && typeof t.completed === 'boolean' && (t.minutes === null || finite(t.minutes));
  if (!data.goals.every(g => record(g) && text(g.id) && g.id && text(g.aspiration) && text(g.outcome) && text(g.area) && text(g.milestone) && finite(g.weeks) && finite(g.weeklyHours) && task(g.task))) fail('Backup contains invalid goals.');
  if (!data.tasks.every(t => task(t) && text(t.id) && t.id && !t.id.startsWith('first:') && (t.goalId == null || text(t.goalId)))) fail('Backup contains invalid tasks.');
  if (new Set(data.goals.map(g => g.id)).size !== data.goals.length || new Set(data.tasks.map(t => t.id)).size !== data.tasks.length) fail('Backup has duplicate goal or task identifiers.');
  const ids = new Set([...data.tasks.map(t => t.id), ...data.goals.map(g => 'first:' + g.id)]);
  if (data.tasks.some(t => t.goalId && !data.goals.some(g => g.id === t.goalId))) fail('A task references a missing goal.');
  if (!['aspiration','area','outcome','weeks','hours','milestone','action','minutes'].every(k => text(data.draft[k]))) fail('Invalid Quick Start draft.');
  const sessions = data.sessions ?? [];
  const session = s => record(s) && text(s.id) && text(s.taskId) && ids.has(s.taskId) && text(s.taskTitle) && finite(s.startedAt) && finite(s.unpausedMs) && finite(s.plannedMinutes) && Array.isArray(s.pauses) && s.pauses.every(p => record(p) && finite(p.at) && text(p.reason));
  if (!Array.isArray(sessions) || !sessions.every(s => session(s) && ['completed','partial','stopped'].includes(s.status) && finite(s.endedAt) && finite(s.pausedMs) && text(s.note) && (s.focusedMinutes === null || finite(s.focusedMinutes)))) fail('Invalid session history.');
  if (sessions.some(s => s.endedAt < s.startedAt || s.focusedMinutes !== null && s.focusedMinutes * 60000 > s.unpausedMs) || new Set(sessions.map(s => s.id)).size !== sessions.length) fail('Inconsistent session history.');
  if (data.activeSession && !(session(data.activeSession) && ['running','paused','review'].includes(data.activeSession.status) && finite(data.activeSession.lastSeenAt) && record(data.activeSession.reflection) && text(data.activeSession.reflection.note) && text(data.activeSession.reflection.focusedMinutes) && ['completed','partial','stopped'].includes(data.activeSession.reflection.outcome) && (data.activeSession.status !== 'running' || finite(data.activeSession.runningSince)) && (data.activeSession.status !== 'review' || finite(data.activeSession.endedAt)))) fail('Invalid active session.');
  // Retain only supported fields; validate rendered nested records before accepting them.
  const next = { version:1, goals:data.goals, tasks:data.tasks, sessions, activeSession:data.activeSession || null, draft:data.draft, step:Number.isInteger(data.step) && data.step >= 0 && data.step <= 4 ? data.step : 0, selected:data.selected ?? null, view:'today', taskDraft:data.taskDraft || {title:'',minutes:'',goalId:''} };
  if (!record(next.taskDraft) || !['title','minutes','goalId'].every(k => text(next.taskDraft[k]))) fail('Invalid Inbox draft.');
  for (const g of next.goals) {
    if (g.status && !['active','completed'].includes(g.status)) fail('Invalid goal status.');
    if (g.revisions && (!Array.isArray(g.revisions) || !g.revisions.every(r => record(r) && text(r.changedAt) && record(r.previous) && ['outcome','area','weeks','hours','milestone','status'].every(k => text(r.previous[k]))))) fail('Invalid goal definition history.');
  }
  const maps = ['reviews','reviewDrafts','dayPlans','dayDrafts','dayReflections','dayReflectionDrafts','goalEditDrafts'];
  for (const name of maps) {
    next[name] = data[name] || {};
    if (!record(next[name]) || Object.keys(next[name]).some(k => ['__proto__','constructor','prototype'].includes(k))) fail('Invalid ' + name + ' records.');
  }
  if (!Object.values(next.reviews).every(r => record(r) && text(r.text) && finite(r.start) && finite(r.end) && text(r.savedAt))) fail('Invalid review history.');
  if (!Object.values(next.reviewDrafts).every(text) || !Object.values(next.dayReflectionDrafts).every(text)) fail('Invalid reflection drafts.');
  if (!Object.values(next.dayReflections).every(r => record(r) && text(r.text) && text(r.savedAt))) fail('Invalid daily reflections.');
  const dateKey = k => /^\d{4}-\d{2}-\d{2}$/.test(k) && Number.isFinite(+new Date(k + 'T12:00:00'));
  for (const name of ['dayPlans','dayDrafts','dayReflections','dayReflectionDrafts']) if (!Object.keys(next[name]).every(dateKey)) fail('Invalid daily record date.');
  if (!Object.entries(next.dayPlans).every(([key,p]) => record(p) && p.date === key && Array.isArray(p.priorities) && p.priorities.length <= 3 && p.priorities.every(t => record(t) && ids.has(t.taskId) && text(t.title) && (t.minutes === null || finite(t.minutes))) && finite(p.estimatedMinutes) && finite(p.unknownEstimates) && (p.capacityMinutes === null || finite(p.capacityMinutes)) && text(p.note) && text(p.savedAt))) fail('Invalid daily plans.');
  if (!Object.values(next.dayDrafts).every(d => record(d) && Array.isArray(d.priorityIds) && d.priorityIds.length <= 3 && d.priorityIds.every(text) && (text(d.capacity) || finite(d.capacity)) && text(d.note))) fail('Invalid daily plan drafts.');
  if (!Object.values(next.goalEditDrafts).every(d => record(d) && ['outcome','area','weeks','hours','milestone','status'].every(k => text(d[k])))) fail('Invalid goal editing drafts.');
  if (next.step === 4 && !next.goals.some(g => g.id === next.selected)) next.step = 0;
  return next;
}
