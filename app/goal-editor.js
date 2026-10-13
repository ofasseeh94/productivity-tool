export function goalDraft(goal) {
  return { outcome: goal.outcome, area: goal.area, weeks: String(goal.weeks), hours: String(goal.weeklyHours), milestone: goal.milestone, status: goal.status || 'active' };
}
export function goalEditErrors(draft) {
  const errors = {};
  for (const key of ['outcome', 'milestone']) {
    if (!String(draft[key] || '').trim()) errors[key] = 'Add a concrete definition.';
    else if (draft[key].length > 2000) errors[key] = 'Keep this under 2,000 characters.';
  }
  if (String(draft.area || '').length > 2000) errors.area = 'Keep this under 2,000 characters.';
  if (!Number.isInteger(Number(draft.weeks)) || Number(draft.weeks) < 1 || Number(draft.weeks) > 52) errors.weeks = 'Choose 1–52 whole weeks.';
  if (!Number.isFinite(Number(draft.hours)) || Number(draft.hours) < 0.5 || Number(draft.hours) > 80) errors.hours = 'Choose 0.5–80 hours.';
  if (!['active', 'completed'].includes(draft.status)) errors.status = 'Choose an active or completed goal.';
  return errors;
}
export function saveGoalEdit(goal, draft, now) {
  if (Object.keys(goalEditErrors(draft)).length) throw new Error('Complete a valid goal definition.');
  const next = { outcome: draft.outcome.trim(), area: draft.area.trim() || 'Personal', weeks: Number(draft.weeks), weeklyHours: Number(draft.hours), milestone: draft.milestone.trim(), status: draft.status };
  const changed = Object.keys(next).some(key => next[key] !== (key === 'status' ? goal.status || 'active' : goal[key]));
  if (!changed) return false;
  goal.revisions ||= [];
  goal.revisions.push({ changedAt: now, previous: { ...goalDraft(goal), milestoneCompleted: goal.milestoneCompleted === true } });
  if (next.milestone !== goal.milestone) { goal.milestoneCompleted = false; goal.milestoneUpdatedAt = now; }
  if (next.status !== (goal.status || 'active')) goal.statusUpdatedAt = now;
  Object.assign(goal, next, { updatedAt: now });
  return true;
}
