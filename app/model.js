export const emptyDraft = () => ({ aspiration: '', area: 'Personal', outcome: '', weeks: '6', hours: '3', milestone: '', action: '', minutes: '25' });
export function validate(draft) {
  const errors = {};
  for (const key of ['aspiration', 'outcome', 'milestone', 'action']) {
    if (!String(draft[key] || '').trim()) errors[key] = 'Add a little detail before continuing.';
    else if (draft[key].length > 2000) errors[key] = 'Keep this under 2,000 characters.';
  }
  for (const [key, min, max] of [['weeks', 1, 52], ['hours', 0.5, 80], ['minutes', 5, 240]]) {
    const number = Number(draft[key]);
    if (!Number.isFinite(number) || number < min || number > max || (key !== 'hours' && !Number.isInteger(number))) errors[key] = `Choose ${key === 'hours' ? 'a number' : 'a whole number'} from ${min} to ${max}.`;
  }
  if (!errors.hours && !errors.minutes && Number(draft.minutes) > Number(draft.hours) * 60) errors.minutes = 'Your first action exceeds your weekly capacity. Shorten it or increase available time.';
  return errors;
}
export function makeGoal(draft, id, now) {
  const errors = validate(draft);
  if (Object.keys(errors).length) throw new Error('Please complete a valid plan.');
  return { id, createdAt: now, aspiration: draft.aspiration.trim(), area: draft.area.trim() || 'Personal', outcome: draft.outcome.trim(), weeks: Number(draft.weeks), weeklyHours: Number(draft.hours), milestone: draft.milestone.trim(), task: { title: draft.action.trim(), minutes: Number(draft.minutes), completed: false } };
}
